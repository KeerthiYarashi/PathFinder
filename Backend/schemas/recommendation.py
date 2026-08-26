from pydantic import BaseModel
from typing import List

class ScoringBreakdown(BaseModel):
    semantic_similarity: float
    prereq_readiness: float
    difficulty_fit: float
    time_fit: float
    format_match: float
    historical_reward: float
    overall: float

class RecommendedResource(BaseModel):
    resource_id: str
    title: str
    description: str
    url: str
    duration_hours: float
    difficulty_level: int
    format_type: str
    skills_covered: List[str]
    scoring: ScoringBreakdown
    explanation_summary: str
