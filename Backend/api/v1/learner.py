from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import Any
from db.database import get_supabase
from core.security import verify_supabase_jwt
from schemas.learner import LearnerCreate, LearnerResponse

router = APIRouter()

@router.post("/", response_model=LearnerResponse, status_code=status.HTTP_201_CREATED)
def create_learner(learner_in: LearnerCreate, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)) -> Any:
    """
    Create a new learner profile.
    """
    # Convert Pydantic model to dict, handling enums properly by accessing their values
    learner_data = learner_in.model_dump()
    if hasattr(learner_in.preferred_format, 'value'):
        learner_data['preferred_format'] = learner_in.preferred_format.value
    if hasattr(learner_in.difficulty_tolerance, 'value'):
        learner_data['difficulty_tolerance'] = learner_in.difficulty_tolerance.value

    target_role = learner_data.pop('target_role', None)

    # Insert into Supabase
    response = db.table("learners").insert(learner_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="Could not create learner")
        
    created_learner = response.data[0]
    learner_id = created_learner.get("id")
    
    if target_role and learner_id:
        try:
            db.table("learning_goals").upsert({
                "learner_id": learner_id,
                "target_role_id": target_role
            }).execute()
        except Exception as e:
            print(f"Warning: Could not save target_role to learning_goals: {e}")
            
    created_learner["target_role"] = target_role
    return created_learner

@router.get("/{learner_id}", response_model=LearnerResponse)
def get_learner(learner_id: str, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)) -> Any:
    """
    Fetch a learner profile by ID.
    """
    response = db.table("learners").select("*").eq("id", learner_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Learner not found")
        
    return response.data[0]
