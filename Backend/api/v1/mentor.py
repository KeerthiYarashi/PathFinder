from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from supabase import Client
from db.database import get_supabase
from services.mentor_agent import MentorAgentService

router = APIRouter()

class MentorChatRequest(BaseModel):
    learner_id: str
    message: str

class MentorChatResponse(BaseModel):
    response: str
    tools_used: List[str]

@router.post("/chat", response_model=MentorChatResponse)
def talk_to_mentor(request: MentorChatRequest, db: Client = Depends(get_supabase)):
    learner_response = db.table("learners").select("*").eq("id", request.learner_id).execute()
    learner_data = learner_response.data[0] if learner_response.data else {}
    
    role_res = db.table("learning_goals").select("target_role_id").eq("learner_id", request.learner_id).execute()
    if role_res.data:
        learner_data["target_role"] = role_res.data[0]["target_role_id"]
        
    mentor_service = MentorAgentService(learner_data)
    response, tools_used = mentor_service.chat(request.message)
    
    return MentorChatResponse(
        response=response,
        tools_used=tools_used
    )
