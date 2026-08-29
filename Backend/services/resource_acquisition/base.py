from pydantic import BaseModel, Field
from typing import List, Optional

class NormalizedResource(BaseModel):
    id: str
    title: str
    description: str
    provider: str
    source: str = Field(..., description="apify | youtube | coursera_dataset | other")
    url: str
    duration_hours: float
    difficulty_level: int = 2 # 1=Beginner, 2=Intermediate, 3=Advanced
    skills: List[str] = []
    metadata: dict = {}

class ResourceAcquisitionClient:
    def acquire(self, query: str, max_results: int = 3) -> List[NormalizedResource]:
        raise NotImplementedError("Subclasses must implement acquire()")
