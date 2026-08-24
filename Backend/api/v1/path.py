from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from supabase import Client
from db.database import get_supabase
from schemas.path import GapAnalysisResponse
from schemas.timeline import LearningTimeline
from services.data_access import analyze_learner_gaps, generate_learner_timeline, get_learner_profile

router = APIRouter()

@router.get("/gaps/{learner_id}", response_model=GapAnalysisResponse)
def get_learner_gaps(learner_id: str, db: Client = Depends(get_supabase)):
    """
    Analyzes a learner's current skills against their target role
    and returns a prioritized list of missing skills.
    """
    return analyze_learner_gaps(learner_id, db)

def get_learner_recommendations(learner_id: str, db: Client = Depends(get_supabase)):
    """
    Finds the learner's biggest skill gap, searches for resources using pgvector,
    and scores them based on the learner's preferences.
    """
    # 1. Fetch the user's profile to get their constraints (time budget, difficulty)
    learner_response = db.table("learners").select("*").eq("id", learner_id).execute()
    if not learner_response.data:
        raise HTTPException(status_code=404, detail="Learner not found")
        
    learner = learner_response.data[0]
    time_budget = learner.get("time_budget_hours", 5)
    difficulty = learner.get("difficulty_tolerance", "normal")
    
    # 2. Run the Skill-Gap engine to find what they need to learn
    gap_analysis = get_learner_gaps(learner_id, db)
    
    if not gap_analysis.gaps:
        return {"message": "No skill gaps found! Learner has mastered everything."}
        
    # Pick the biggest/most important gap
    top_gap = gap_analysis.gaps[0]
    
    from schemas.timeline import Resource
    # STUB: Person B will implement Vector Search and Recommendation Scoring here.
    # For now, returning dummy resources so Person C's API works.
    ranked_resources = [
        Resource(
            id="mock_123",
            title=f"Mock Resource for {top_gap.skill_name}",
            time_estimate_hours=2.0,
            difficulty="normal"
        )
    ]
    
    return {
        "learner_id": learner_id,
        "targeted_skill": top_gap.skill_name,
        "recommendations": ranked_resources[:3] # Return top 3
    }

@router.get("/generate/{learner_id}", response_model=LearningTimeline)
def generate_learner_path(learner_id: str, db: Client = Depends(get_supabase)):
    """
    The capstone endpoint: Generates a fully sequenced learning timeline.
    """
    try:
        return generate_learner_timeline(learner_id, db)
    except ValueError as e:
        if str(e) == "Learner not found":
            raise HTTPException(status_code=404, detail="Learner not found")
        raise HTTPException(status_code=400, detail=str(e))


