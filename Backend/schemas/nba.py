from pydantic import BaseModel
from typing import Literal

class NextBestAction(BaseModel):
    type: Literal["continue", "review", "priority", "celebrate", "welcome_back"]
    title: str
    description: str
    module_id: str | None
