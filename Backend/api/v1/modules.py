from fastapi import APIRouter, Depends, HTTPException
# pyrefly: ignore [missing-import]
from supabase import Client
from db.database import get_supabase
from schemas.progress import ModuleAction, ActionResponse, ActionType
from engines.adaptive import handle_struggling_action, handle_complete_action
from core.security import verify_supabase_jwt
from services.llm import LLMService

router = APIRouter()

@router.post("/action", response_model=ActionResponse)
def log_module_action(action: ModuleAction, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    """
    Logs a user action (complete, struggling) and triggers the adaptive engine.
    Returns whether the frontend needs to re-fetch the `/paths/generate` endpoint.
    """
    try:
        if action.action_type == ActionType.struggling:
            msg = handle_struggling_action(action.learner_id, action.skill_id, db)
            return ActionResponse(
                status="success", 
                message=msg, 
                requires_recalculation=True
            )
            
        elif action.action_type == ActionType.complete:
            msg = handle_complete_action(action.learner_id, action.skill_id, db)
            return ActionResponse(
                status="success", 
                message=msg, 
                requires_recalculation=True
            )
            
        elif action.action_type == ActionType.skip:
            return ActionResponse(
                status="success",
                message="Skipped module.",
                requires_recalculation=False # No DB changes for a simple skip yet
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process action: {str(e)}")

@router.get("/{module_id}/explanation")
def get_explanation(module_id: str, learner_id: str, db: Client = Depends(get_supabase), current_user = Depends(verify_supabase_jwt)):
    # 1. Fetch learner's path
    path_response = db.table("learning_paths").select("path_data").eq("learner_id", learner_id).execute()
    
    if not path_response.data:
        raise HTTPException(404, "No path found for learner")
        
    path_data = path_response.data[0].get("path_data", {})
    resource_scoring = None
    
    # 2. Find the module in the path
    for week in path_data.get("weeks", []):
        for mod in week.get("modules", []):
            res = mod.get("resource", {})
            if res.get("id") == module_id:
                resource_scoring = res.get("scoring_factors")
                break
        if resource_scoring:
            break
            
    if not resource_scoring:
        raise HTTPException(404, "Module not found in learner's path or no scoring data available")
        
    # 3. Fetch cached explanation from recommendations_cache
    rec = db.table("recommendations_cache").select("explanation_text").eq("learner_id", learner_id).eq("resource_id", module_id).execute()
    
    if rec.data and rec.data[0].get("explanation_text"):
        return {"scoring_factors": resource_scoring, "explanation": rec.data[0]["explanation_text"]}
        
    # 4. Generate via LLM
    llm_service = LLMService()
    
    learner_response = db.table("learners").select("*").eq("id", learner_id).execute()
    learner_context = learner_response.data[0] if learner_response.data else {}
    
    explanation = llm_service.generate_explanation(resource_scoring, learner_context)
    
    # 5. Cache it
    db.table("recommendations_cache").upsert({
        "learner_id": learner_id,
        "resource_id": module_id,
        "scoring_factors": resource_scoring,
        "explanation_text": explanation
    }).execute()
    
    return {"scoring_factors": resource_scoring, "explanation": explanation}
