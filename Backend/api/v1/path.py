from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from supabase import Client
from db.database import get_supabase
from schemas.path import GapAnalysisResponse
from schemas.timeline import LearningTimeline
from services.data_access import analyze_learner_gaps, generate_learner_timeline, get_learner_profile
from core.security import verify_supabase_jwt

router = APIRouter()

@router.get("/gaps/{learner_id}", response_model=GapAnalysisResponse)
def get_learner_gaps(learner_id: str, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    """
    Analyzes a learner's current skills against their target role
    and returns a prioritized list of missing skills.
    """
    return analyze_learner_gaps(learner_id, db)

@router.get("/recommendations/{learner_id}")
def get_learner_recommendations(learner_id: str, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
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
    
    # Get learner mastery dict
    skills_response = db.table("learner_skills").select("skill_id, mastery_level").eq("learner_id", learner_id).execute()
    learner_mastery = {}
    if skills_response.data:
        for row in skills_response.data:
            learner_mastery[row["skill_id"]] = row["mastery_level"]
            
    from services.vector_store import VectorStoreService
    from engines.recommendation import RecommendationEngine
    
    vector_store = VectorStoreService()
    recommendation_engine = RecommendationEngine(vector_store)
    
    recommended = recommendation_engine.get_best_resource_for_gap(
        gap=top_gap,
        learner_profile=learner,
        learner_mastery=learner_mastery
    )
    
    ranked_resources = []
    if recommended:
        ranked_resources.append(recommended)
    
    return {
        "learner_id": learner_id,
        "targeted_skill": top_gap.skill_name,
        "recommendations": ranked_resources
    }

@router.get("/generate/{learner_id}", response_model=LearningTimeline)
def generate_learner_path(learner_id: str, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    """
    The capstone endpoint: Generates a fully sequenced learning timeline.
    """
    try:
        return generate_learner_timeline(learner_id, db)
    except ValueError as e:
        if str(e) == "Learner not found":
            raise HTTPException(status_code=404, detail="Learner not found")
        raise HTTPException(status_code=400, detail=str(e))

from schemas.nba import NextBestAction
from engines.nba import NBAEngine

@router.get("/nba/{learner_id}", response_model=NextBestAction)
def get_nba(learner_id: str, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    # Fetch learner's path
    path_response = db.table("learning_paths").select("path_data").eq("learner_id", learner_id).execute()
    
    modules = []
    if path_response.data:
        path_data = path_response.data[0].get("path_data", {})
        for week in path_data.get("weeks", []):
            modules.extend(week.get("modules", []))
            
    # Mock some data for the NBA engine (in production this would come from progress_log)
    recent_scores = [0.85] 
    is_behind = False
    last_activity_days = 2
    
    engine = NBAEngine()
    return engine.compute(modules, recent_scores, is_behind, last_activity_days)


