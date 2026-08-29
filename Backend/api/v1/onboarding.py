from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import pdfplumber
import pytesseract
from pdf2image import convert_from_bytes
import io
from pydantic import BaseModel
from typing import List, Optional
from schemas.learner import ExtractedProfile
from schemas.timeline import LearningTimeline
from schemas.path import SkillGap
from supabase import Client
from db.database import get_supabase
from services.llm import LLMService
from engines.skill_gap import calculate_skill_gaps
from engines.recommendation import RecommendationEngine
from engines.path_generator import generate_timeline
from services.vector_store import VectorStoreService
from services.resource_acquisition import ResourceAcquisitionOrchestrator
from services.resource_acquisition.base import NormalizedResource
from services.tools import search_coursera, search_youtube
from core.security import verify_supabase_jwt

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    learner_id: str = "temp_user"
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    extracted_profile: Optional[ExtractedProfile] = None
    is_complete: bool
    preview: Optional[dict] = None

class UploadPreviewResponse(BaseModel):
    extracted_profile: ExtractedProfile
    skill_gaps: List[SkillGap]
    timeline: LearningTimeline

class ExtractionMetadata(BaseModel):
    resume_text_method: str
    ocr_used: bool
    warnings: List[str]

class UploadExtractResponse(BaseModel):
    extracted_profile: ExtractedProfile
    extraction: ExtractionMetadata

class ConfirmProfileRequest(BaseModel):
    learner_id: str
    name: str
    profile: ExtractedProfile
    
def shared_learning_pipeline(profile: ExtractedProfile, learner_id: str = "preview_user"):
    # 1. Deterministic Skill Gap Engine
    current_skills_dict = {s.skill: 3 if s.proficiency == "Advanced" else (2 if s.proficiency == "Intermediate" else 1) for s in profile.current_skills}
    
    gaps = calculate_skill_gaps(
        target_role=profile.target_role or "Career Professional",
        current_skills=current_skills_dict,
        jd_required_skills={s: 3 for s in profile.required_skills} if profile.required_skills else None
    )
    
    vector_store = None
    try:
        # 2. Query Generation
        llm_service = LLMService()
        missing_skill_names = [gap.skill_name for gap in gaps]
        queries = llm_service.generate_search_queries(missing_skill_names, profile.target_role or "Professional")
        
        # 3. Live Resource Acquisition
        all_raw_resources = []
        for skill_name, query in queries.items():
            try:
                coursera_res = search_coursera.invoke({"query": query})
                youtube_res = search_youtube.invoke({"query": query})
                all_raw_resources.extend(coursera_res)
                all_raw_resources.extend(youtube_res)
            except Exception:
                pass
            
        if all_raw_resources:
            new_resources = [NormalizedResource(**r) for r in all_raw_resources]
            temp_store = VectorStoreService()
            orchestrator = ResourceAcquisitionOrchestrator(temp_store)
            orchestrator.cache_resources(new_resources)
    except Exception as e:
        print(f"Warning: Resource acquisition pipeline warning (falling back to generated curriculum): {e}")
        
    # 4. Recommendation + DAG Path Gen
    vector_store = VectorStoreService()
    recommendation_engine = RecommendationEngine(vector_store)
    timeline = generate_timeline(
        learner_id=learner_id,
        target_role=profile.target_role or "Career Professional",
        skill_gaps=gaps,
        time_budget=profile.learning_preferences.weekly_hours if profile.learning_preferences else 10,
        difficulty=profile.learning_preferences.difficulty if profile.learning_preferences else "normal",
        recommendation_engine=recommendation_engine,
        learner_mastery=current_skills_dict
    )
    
    return {
        "extracted_profile": profile,
        "skill_gaps": gaps,
        "timeline": timeline
    }

@router.post("/chat", response_model=ChatResponse)
def extract_profile_from_chat(request: ChatRequest, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    llm_service = LLMService()
    
    conversation = [{"role": msg.role, "content": msg.content} for msg in request.history]
    conversation.append({"role": "user", "content": request.message})
    
    profile = llm_service.extract_profile(conversation)
    
    # Basic check for completeness
    is_complete = bool(profile.target_role and profile.target_role != "")
    
    if is_complete or len(conversation) >= 6:
        is_complete = True
        reply = "Great! I have enough information to build your personalized learning path. Here is a preview!"
        preview = shared_learning_pipeline(profile, current_user.id)
    else:
        reply = llm_service.generate_followup_question(profile.model_dump())
        is_complete = False
        profile = None
        preview = None
        
    return ChatResponse(
        reply=reply,
        extracted_profile=profile,
        is_complete=is_complete,
        preview=preview
    )

@router.post("/upload", response_model=UploadExtractResponse)
async def upload_resume_jd(
    resume: UploadFile = File(None),
    jd_text: str = Form(""),
    db: Client = Depends(get_supabase),
    current_user = Depends(verify_supabase_jwt)
):
    if not resume and not jd_text:
        raise HTTPException(status_code=400, detail="Must provide either a resume PDF or JD text.")
        
    resume_text = ""
    metadata = ExtractionMetadata(resume_text_method="none", ocr_used=False, warnings=[])
    
    if resume and resume.filename.endswith(".pdf"):
        try:
            content = await resume.read()
            # 1. Try pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        resume_text += text + "\n"
                        
            if len(resume_text.strip()) > 50:
                metadata.resume_text_method = "pdfplumber"
            else:
                # 2. OCR Fallback
                try:
                    images = convert_from_bytes(content)
                    ocr_text = ""
                    for img in images:
                        ocr_text += pytesseract.image_to_string(img) + "\n"
                    
                    if len(ocr_text.strip()) > 50:
                        resume_text = ocr_text
                        metadata.resume_text_method = "ocr"
                        metadata.ocr_used = True
                    else:
                        metadata.warnings.append("OCR ran but found no usable text.")
                        
                except ImportError:
                    metadata.resume_text_method = "pdfplumber"
                    metadata.warnings.append("OCR dependencies (Poppler/Tesseract) missing. Falling back to pdfplumber text.")
                except Exception as e:
                    metadata.resume_text_method = "pdfplumber"
                    metadata.warnings.append(f"OCR failed: {str(e)}. Falling back to pdfplumber text.")
                    
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
            
    llm_service = LLMService()
    try:
        profile = llm_service.extract_profile_from_resume_jd(resume_text, jd_text)
        return UploadExtractResponse(
            extracted_profile=profile,
            extraction=metadata
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM extraction failed: {str(e)}")


@router.post("/confirm", response_model=UploadPreviewResponse)
def confirm_profile(request: ConfirmProfileRequest, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    # Persist the confirmed profile
    try:
        user_id = getattr(current_user, 'id', 'demo-user')
        learner_data = {
            "id": user_id,
            "name": request.profile.full_name or request.name,
            "time_budget_hours": request.profile.learning_preferences.weekly_hours if request.profile.learning_preferences else 10,
            "difficulty_tolerance": request.profile.learning_preferences.difficulty if request.profile.learning_preferences else "normal"
        }
        if db:
            db.table("learners").upsert(learner_data).execute()
            
            if request.profile.target_role:
                db.table("learning_goals").upsert({
                    "learner_id": user_id,
                    "target_role_id": request.profile.target_role
                }).execute()
            
            for skill_prof in request.profile.current_skills:
                level_map = {"Advanced": 3, "Intermediate": 2, "Beginner": 1, "Unknown": 0}
                db.table("learner_skills").upsert({
                    "learner_id": user_id,
                    "skill_id": skill_prof.skill,
                    "mastery_level": level_map.get(skill_prof.proficiency, 0)
                }).execute()
    except Exception as e:
        print(f"Warning: Could not persist to DB (proceeding in memory/demo mode): {e}")
        
    # Execute the learning pipeline using the CONFIRMED profile
    user_id = getattr(current_user, 'id', 'preview_user')
    preview = shared_learning_pipeline(request.profile, user_id)
    return UploadPreviewResponse(**preview)
