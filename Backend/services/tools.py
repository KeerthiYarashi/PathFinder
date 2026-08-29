from langchain_core.tools import tool
from typing import List, Dict, Any
from services.resource_acquisition.service import ResourceAcquisitionOrchestrator
from services.vector_store import VectorStoreService

@tool
def search_coursera(query: str) -> List[Dict[str, Any]]:
    """Search Coursera via RapidAPI for live courses matching the skill query."""
    vector_store = VectorStoreService()
    orchestrator = ResourceAcquisitionOrchestrator(vector_store)
    
    resources = orchestrator.search_coursera(query)
    return [r.model_dump() for r in resources]

@tool
def search_youtube(query: str) -> List[Dict[str, Any]]:
    """Search YouTube via RapidAPI for live tutorial videos matching the skill query."""
    vector_store = VectorStoreService()
    orchestrator = ResourceAcquisitionOrchestrator(vector_store)
    
    resources = orchestrator.search_youtube(query)
    return [r.model_dump() for r in resources]
