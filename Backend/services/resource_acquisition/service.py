from typing import List, Dict
from services.resource_acquisition.base import NormalizedResource
from services.resource_acquisition.youtube import YouTubeClient
from services.resource_acquisition.coursera_rapidapi import CourseraRapidApiClient
from services.vector_store import VectorStoreService

class ResourceAcquisitionOrchestrator:
    def __init__(self, vector_store: VectorStoreService):
        self.youtube_client = YouTubeClient()
        self.coursera_client = CourseraRapidApiClient()
        self.vector_store = vector_store

    def search_youtube(self, query: str) -> List[NormalizedResource]:
        print(f"Acquiring live YouTube resources for query: '{query}'")
        return self.youtube_client.acquire(query, max_results=3)
        
    def search_coursera(self, query: str) -> List[NormalizedResource]:
        print(f"Acquiring live Coursera resources for query: '{query}'")
        return self.coursera_client.acquire(query, max_results=2)

    def cache_resources(self, resources: List[NormalizedResource]):
        if not resources:
            print("No new live resources to cache.")
            return

        unique_resources = self._deduplicate(resources)
        print(f"Ingesting {len(unique_resources)} unique resources into pgvector cache.")
        resource_dicts = [r.model_dump() for r in unique_resources]
        self.vector_store.add_resources(resource_dicts)

    def acquire_and_cache(self, search_queries: Dict[str, str]):
        """
        Legacy orchestrator method. Retained for backwards compatibility if needed.
        """
        if not search_queries:
            return

        all_new_resources: List[NormalizedResource] = []

        for skill, query in search_queries.items():
            all_new_resources.extend(self.search_youtube(query))
            all_new_resources.extend(self.search_coursera(query))

        self.cache_resources(all_new_resources)

    def _deduplicate(self, resources: List[NormalizedResource]) -> List[NormalizedResource]:
        """
        Deduplicate incoming resources. Also checks if they already exist in pgvector.
        """
        unique_dict = {}
        for r in resources:
            # We use URL as the primary canonical key
            key = r.url.lower().strip()
            if not key:
                key = r.title.lower().strip()
                
            if key not in unique_dict:
                # Optional: We could also query vector_store.get_resource_by_id(r.id) here, 
                # but it might be slow for many resources. URL is a good heuristic.
                unique_dict[key] = r
                
        return list(unique_dict.values())
