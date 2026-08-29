import requests
import time
from typing import List, Dict
from core.config import settings
from services.resource_acquisition.base import NormalizedResource, ResourceAcquisitionClient

class ApifyClient(ResourceAcquisitionClient):
    def __init__(self, actor_id: str = None):
        self.apify_token = settings.APIFY_API_TOKEN
        self.actor_id = actor_id or settings.APIFY_COURSE_ACTOR_ID

    def acquire(self, query: str, max_results: int = 3) -> List[NormalizedResource]:
        if not self.apify_token or not self.actor_id:
            print("Warning: Apify token or Actor ID not set. Skipping Apify live acquisition.")
            return []
            
        print(f"ApifyLiveSearch: Triggering {self.actor_id} for query '{query}'")

        # We can use the synchronous endpoint to run and fetch dataset items in one call.
        # This prevents manual polling and uses the modern /v2/actors/ prefix.
        run_url = f"https://api.apify.com/v2/actors/{self.actor_id}/run-sync-get-dataset-items?token={self.apify_token}"
        payload = {
            "query": query,
            "keyword": query,
            "search": query,
            "maxResults": max_results,
            "limit": max_results
        }
        
        try:
            # 1. Trigger the run synchronously and wait for the dataset items
            # Using a generous timeout of 60 seconds for live scraping
            response = requests.post(run_url, json=payload, timeout=60)
            
            if response.status_code == 408:
                print(f"Apify run for query '{query}' timed out after 60s.")
                return []
                
            response.raise_for_status()
            items = response.json()
            
            # 2. Normalize
            formatted_results = []
            for item in items:
                # Be flexible since we don't know the exact schema of the chosen actor
                title = item.get("title", item.get("name", "Unknown Title"))
                url = item.get("url", item.get("link", ""))
                description = item.get("description", item.get("summary", ""))
                
                # Deduplicate by avoiding empty URLs
                if not url:
                    continue
                    
                formatted_results.append(NormalizedResource(
                    id=f"apify_{hash(url)}",
                    title=title,
                    description=description,
                    provider=item.get("provider", item.get("author", "Apify Source")),
                    source="apify",
                    url=url,
                    duration_hours=float(item.get("duration_hours", item.get("duration", 5.0))),
                    difficulty_level=int(item.get("difficulty_level", 2)),
                    skills=[query], # Tag it with the query it was found for
                    metadata=item
                ))
            return formatted_results
            
        except Exception as e:
            print(f"Apify live acquisition failed: {e}")
            return []
