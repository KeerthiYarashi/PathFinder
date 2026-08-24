from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from schemas.learner import ExtractedProfile

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/extract", response_model=ExtractedProfile)
def extract_profile_from_chat(request: ChatRequest):
    """
    STUB: Person B will implement the LLM extraction.
    Returning mock profile so API works.
    """
    return ExtractedProfile(
        target_role="data_scientist",
        current_skills={"python_basics": 4},
        time_budget_hours=10,
        difficulty_tolerance="normal"
    )
