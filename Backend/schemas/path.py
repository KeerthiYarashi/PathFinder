from pydantic import BaseModel
from typing import List

class SkillGap(BaseModel):
    skill_id: str
    skill_name: str
    current_level: int
    target_level: int
    gap_size: int
    priority: str # 'high', 'medium', 'low'

class GapAnalysisResponse(BaseModel):
    learner_id: str
    target_role: str
    total_gaps: int
    gaps: List[SkillGap]
