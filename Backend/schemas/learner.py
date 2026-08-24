from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from enum import Enum
from datetime import datetime
from uuid import UUID

class PreferredFormat(str, Enum):
    video = 'video'
    article = 'article'
    project = 'project'
    mixed = 'mixed'

class DifficultyTolerance(str, Enum):
    low = 'low'
    normal = 'normal'
    high = 'high'

class LearnerBase(BaseModel):
    name: str = Field(..., description="The learner's full name")
    time_budget_hours: float = Field(..., gt=0, description="Hours per week the learner can dedicate")
    preferred_format: PreferredFormat = Field(default=PreferredFormat.video)
    difficulty_tolerance: DifficultyTolerance = Field(default=DifficultyTolerance.normal)

class LearnerCreate(LearnerBase):
    pass

class LearnerResponse(LearnerBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ExtractedProfile(BaseModel):
    target_role: str
    current_skills: dict[str, int]
    time_budget_hours: float
    difficulty_tolerance: str
