from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from schemas.learner import ExtractedProfile
from supabase import Client
from db.database import get_supabase
from services.llm import LLMService

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

class ConfirmProfileRequest(BaseModel):
    learner_id: str
    name: str
    profile: ExtractedProfile

@router.post("/chat", response_model=ChatResponse)
def extract_profile_from_chat(request: ChatRequest, db: Client = Depends(get_supabase)):
    llm_service = LLMService()
    
    conversation = [{"role": msg.role, "content": msg.content} for msg in request.history]
    conversation.append({"role": "user", "content": request.message})
    
    profile = llm_service.extract_profile(conversation)
    
    # Basic check for completeness
    is_complete = bool(profile.target_role and profile.target_role != "")
    
    if is_complete or len(conversation) >= 6:
        is_complete = True
        reply = "Great! I have enough information to build your personalized learning path. Please confirm your details."
    else:
        reply = llm_service.generate_followup_question(profile.model_dump())
        is_complete = False
        profile = None
        
    return ChatResponse(
        reply=reply,
        extracted_profile=profile,
        is_complete=is_complete
    )

@router.post("/confirm")
def confirm_profile(request: ConfirmProfileRequest, db: Client = Depends(get_supabase)):
    learner_data = {
        "id": request.learner_id,
        "name": request.name,
        "time_budget_hours": request.profile.time_budget_hours,
        "difficulty_tolerance": request.profile.difficulty_tolerance
    }
    
    db.table("learners").upsert(learner_data).execute()
    
    db.table("learning_goals").upsert({
        "learner_id": request.learner_id,
        "target_role_id": request.profile.target_role
    }).execute()
    
    for skill, level in request.profile.current_skills.items():
        db.table("learner_skills").upsert({
            "learner_id": request.learner_id,
            "skill_id": skill,
            "mastery_level": level
        }).execute()
        
    return {"status": "success", "learner_id": request.learner_id}
