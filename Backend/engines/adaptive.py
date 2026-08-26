from supabase import Client
from engines.path_generator import get_prerequisites
from services.data_access import generate_learner_timeline
import random

def handle_struggling_action(learner_id: str, skill_id: str, db: Client) -> str:
    """
    If a user is struggling with a skill, we assume they forgot the prerequisite.
    This function finds the prerequisite and lowers their mastery score in the database,
    which will force the Path Generator to inject it as a refresher course.
    """
    prereqs = get_prerequisites().get(skill_id, [])
    
    if not prereqs:
        return f"User is struggling with {skill_id}, but it has no prerequisites to refresh. We will just recommend a different resource for the same skill."
        
    # Pick the first prerequisite to downgrade
    # In a production app, we would use an AI agent to ask them a diagnostic question 
    # to find out EXACTLY which prerequisite they forgot!
    target_prereq = prereqs[0]
    
    # 1. Fetch current mastery level of that prereq
    response = db.table("learner_skills").select("mastery_level").eq("learner_id", learner_id).eq("skill_id", target_prereq).execute()
    
    current_level = 3 # Assume they mastered it if we can't find it
    if response.data:
        current_level = response.data[0].get("mastery_level", 3)
        
    # 2. Downgrade it (but don't go below 1)
    new_level = max(1, current_level - 1)
    
    # 3. Upsert it back into the DB
    db.table("learner_skills").upsert({
        "learner_id": learner_id,
        "skill_id": target_prereq,
        "mastery_level": new_level
    }).execute()
    
    # 4. Regenerate timeline
    try:
        new_timeline = generate_learner_timeline(learner_id, db)
        db.table("learning_paths").upsert({
            "learner_id": learner_id,
            "path_data": new_timeline.model_dump()
        }).execute()
    except Exception as e:
        print(f"Error recalculating path: {e}")
    
    return f"Downgraded prerequisite '{target_prereq}' to level {new_level}. The path has been recalculated."

def handle_complete_action(learner_id: str, skill_id: str, db: Client) -> str:
    """
    Marks a skill as mastered.
    """
    # Upsert mastery level to maximum (e.g. 3)
    db.table("learner_skills").upsert({
        "learner_id": learner_id,
        "skill_id": skill_id,
        "mastery_level": 3
    }).execute()
    
    return f"Successfully mastered {skill_id}! The path must be recalculated to remove this from the gaps."
