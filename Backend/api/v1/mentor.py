from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
# pyrefly: ignore [missing-import]
from supabase import Client
from db.database import get_supabase
from services.mentor_agent import MentorAgentService
from core.security import verify_supabase_jwt

router = APIRouter()

class MentorChatRequest(BaseModel):
    learner_id: str
    message: str

class MentorChatResponse(BaseModel):
    response: str
    tools_used: List[str]

@router.post("/chat", response_model=MentorChatResponse)
def talk_to_mentor(request: MentorChatRequest, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    learner_response = db.table("learners").select("*").eq("id", request.learner_id).execute()
    learner_data = learner_response.data[0] if learner_response.data else {}
    
    role_res = db.table("learning_goals").select("target_role_id").eq("learner_id", request.learner_id).execute()
    if role_res.data:
        learner_data["target_role"] = role_res.data[0]["target_role_id"]
        
    # --- FAST PATH: Apify Coursera Scraper Fallback ---
    # To save LLM tokens, check if the user is asking for courses.
    # We trigger the scraper with their raw message (or a cleaned version).
    from services.coursera_scraper import CourseraScraperService
    scraper = CourseraScraperService()
    
    # Simple heuristic to determine if we should try scraping
    lower_msg = request.message.lower()
    if "course" in lower_msg or "learn" in lower_msg or "recommend" in lower_msg:
        # Pass the raw message as a query (the scraper should handle keyword matching)
        courses = scraper.search_courses(request.message)
        if courses:
            # We found courses! Return them directly without wasting LLM tokens.
            lines = ["Here are some great courses I found for you directly from Coursera:\n"]
            for c in courses:
                lines.append(f"- **{c['title']}**\n  {c['description'][:100]}...\n  [View Course]({c['url']})\n")
            
            return MentorChatResponse(
                response="\n".join(lines),
                tools_used=["coursera_scraper_fastpath"]
            )
            
    # --- REGULAR PATH: LLM Agent ---
    mentor_service = MentorAgentService(learner_data)
    response, tools_used = mentor_service.chat(request.message)
    
    return MentorChatResponse(
        response=response,
        tools_used=tools_used
    )
