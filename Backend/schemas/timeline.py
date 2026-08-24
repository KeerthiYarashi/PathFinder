from pydantic import BaseModel
from typing import List, Dict, Any

class Resource(BaseModel):
    id: str
    title: str
    time_estimate_hours: float
    difficulty: str
    url: str | None = None

class Module(BaseModel):
    skill_id: str
    skill_name: str
    resource: Resource
    estimated_hours: float

class Week(BaseModel):
    week_number: int
    modules: List[Module]
    total_hours: float

class LearningTimeline(BaseModel):
    learner_id: str
    target_role: str
    total_weeks: int
    weeks: List[Week]
