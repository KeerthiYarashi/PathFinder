from pydantic import BaseModel
from enum import Enum

class ActionType(str, Enum):
    complete = 'complete'
    struggling = 'struggling'
    skip = 'skip'

class ModuleAction(BaseModel):
    learner_id: str
    skill_id: str
    action_type: ActionType
    
class ActionResponse(BaseModel):
    status: str
    message: str
    requires_recalculation: bool
