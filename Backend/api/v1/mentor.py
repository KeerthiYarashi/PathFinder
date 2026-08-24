from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class MentorChatRequest(BaseModel):
    learner_id: str
    message: str

class MentorChatResponse(BaseModel):
    response: str

@router.post("/chat", response_model=MentorChatResponse)
def talk_to_mentor(request: MentorChatRequest):
    """
    STUB: Person B (AI Engineer) will connect their LangGraph agent here.
    For now, Person C (Backend API) returns a dummy response.
    """
    return MentorChatResponse(
        response=f"STUB MENTOR RESPONSE. Awaiting Person B to implement LangGraph."
    )
