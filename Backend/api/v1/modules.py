from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from db.database import get_supabase
from schemas.progress import ModuleAction, ActionResponse, ActionType
from engines.adaptive import handle_struggling_action, handle_complete_action

router = APIRouter()

@router.post("/action", response_model=ActionResponse)
def log_module_action(action: ModuleAction, db: Client = Depends(get_supabase)):
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
