# pyrefly: ignore [missing-import]
from supabase import Client
from typing import Dict, Any, Tuple
from schemas.path import GapAnalysisResponse
from engines.skill_gap import calculate_skill_gaps
from schemas.timeline import LearningTimeline

def get_learner_profile(learner_id: str, db: Client) -> Dict[str, Any]:
    """Helper to fetch a learner's profile preferences."""
    learner_response = db.table("learners").select("*").eq("id", learner_id).execute()
    if not learner_response.data:
        raise ValueError("Learner not found")
    return learner_response.data[0]

def analyze_learner_gaps(learner_id: str, db: Client) -> GapAnalysisResponse:
    """
    Core logic to fetch skills and calculate gaps.
    Decoupled from FastAPI so AI Agents can use this directly.
    """
    # 1. Fetch Learner's Target Role
    target_role = ""
    try:
        role_response = db.table("learning_goals").select("target_role_id").eq("learner_id", learner_id).execute()
        if role_response.data and len(role_response.data) > 0:
            target_role = role_response.data[0].get("target_role_id", "")
    except Exception:
        pass
        
    if not target_role:
        try:
            learner_res = db.table("learners").select("target_role").eq("id", learner_id).execute()
            if learner_res.data and len(learner_res.data) > 0:
                target_role = learner_res.data[0].get("target_role", "")
        except Exception:
            pass

    if not target_role:
        target_role = "Career Professional"

    # 2. Fetch Learner's Current Skills
    skills_response = db.table("learner_skills").select("skill_id, mastery_level").eq("learner_id", learner_id).execute()
    
    current_skills = {}
    if skills_response.data:
        for row in skills_response.data:
            current_skills[row["skill_id"]] = row["mastery_level"]

    # 3. Run the Skill-Gap Engine
    gaps = calculate_skill_gaps(target_role, current_skills)

    return GapAnalysisResponse(
        learner_id=learner_id,
        target_role=target_role,
        total_gaps=len(gaps),
        gaps=gaps
    )

def generate_learner_timeline(learner_id: str, db: Client) -> LearningTimeline:
    """
    Core logic to generate a full learning timeline.
    Decoupled from FastAPI so AI Agents can use this directly.
    """
    learner = get_learner_profile(learner_id, db)
    time_budget = learner.get("time_budget_hours", 5)
    difficulty = learner.get("difficulty_tolerance", "normal")
    
    gap_analysis = analyze_learner_gaps(learner_id, db)
    if not gap_analysis.gaps:
        raise ValueError("No skill gaps found. Cannot generate path.")
        
    # Get learner mastery dict
    skills_response = db.table("learner_skills").select("skill_id, mastery_level").eq("learner_id", learner_id).execute()
    learner_mastery = {}
    if skills_response.data:
        for row in skills_response.data:
            learner_mastery[row["skill_id"]] = row["mastery_level"]
            
    from services.vector_store import VectorStoreService
    from engines.recommendation import RecommendationEngine
    from engines.path_generator import generate_timeline
    
    vector_store = VectorStoreService()
    recommendation_engine = RecommendationEngine(vector_store)
    
    timeline = generate_timeline(
        learner_id=learner_id,
        target_role=gap_analysis.target_role,
        skill_gaps=gap_analysis.gaps,
        time_budget=time_budget,
        difficulty=difficulty,
        recommendation_engine=recommendation_engine,
        learner_mastery=learner_mastery
    )
    return timeline
