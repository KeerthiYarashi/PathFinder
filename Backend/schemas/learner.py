from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
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

class SkillProficiency(BaseModel):
    skill: str
    proficiency: str = Field(description="Beginner, Intermediate, Advanced, or Unknown")
    evidence: str = Field(description="Evidence from the resume supporting this proficiency level")

class LearningPreferences(BaseModel):
    weekly_hours: float
    preferred_media: List[str] = Field(default_factory=lambda: ["video"])
    difficulty: str = Field(default="normal")
    learning_style: str = Field(default="mixed")
    target_timeline_months: int = Field(default=6)
    budget_preference: str = Field(default="any")

class ExtractedProfile(BaseModel):
    # Basic
    full_name: Optional[str] = None
    current_role: Optional[str] = None
    education: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    
    # Career Goal
    target_role: Optional[str] = None
    target_industry: Optional[str] = None
    
    # Separated Skills
    current_skills: List[SkillProficiency] = Field(default_factory=list)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    
    # Extra Profile Data
    projects: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    
    # Preferences
    learning_preferences: LearningPreferences
