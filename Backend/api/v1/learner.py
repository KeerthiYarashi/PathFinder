from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import Any
from db.database import get_supabase
from schemas.learner import LearnerCreate, LearnerResponse

router = APIRouter()

@router.post("/", response_model=LearnerResponse, status_code=status.HTTP_201_CREATED)
def create_learner(learner_in: LearnerCreate, db: Client = Depends(get_supabase)) -> Any:
    """
    Create a new learner profile.
    """
    # Convert Pydantic model to dict, handling enums properly by accessing their values
    learner_data = learner_in.model_dump()
    if hasattr(learner_in.preferred_format, 'value'):
        learner_data['preferred_format'] = learner_in.preferred_format.value
    if hasattr(learner_in.difficulty_tolerance, 'value'):
        learner_data['difficulty_tolerance'] = learner_in.difficulty_tolerance.value

    # Insert into Supabase
    response = db.table("learners").insert(learner_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create learner")
        
    return response.data[0]

@router.get("/{learner_id}", response_model=LearnerResponse)
def get_learner(learner_id: str, db: Client = Depends(get_supabase)) -> Any:
    """
    Fetch a learner profile by ID.
    """
    response = db.table("learners").select("*").eq("id", learner_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Learner not found")
        
    return response.data[0]
