import requests
import os
from typing import List
from core.config import settings
from services.resource_acquisition.base import NormalizedResource, ResourceAcquisitionClient

class YouTubeClient(ResourceAcquisitionClient):
    def __init__(self):
        # Enforce single RAPIDAPI_KEY usage
        self.api_key = os.getenv("RAPIDAPI_KEY", "")
        self.host = os.getenv("RAPIDAPI_HOST", "youtube-scraper3.p.rapidapi.com")

    def acquire(self, query: str, max_results: int = 3) -> List[NormalizedResource]:
        if not self.api_key:
            print("Warning: RAPIDAPI_KEY is not set. Skipping YouTube live acquisition.")
            return []
            
        print(f"YouTubeLiveSearch (RapidAPI): Searching for '{query}'")

        # Adding the /api/v1 prefix as seen in the Youtube Scraper API docs
        url = "https://youtube-scraper3.p.rapidapi.com/api/v1/search"
        querystring = {"query": query}
        headers = {
            "X-RapidAPI-Key": self.api_key,
            "X-RapidAPI-Host": "youtube-scraper3.p.rapidapi.com"
        }
        
        try:
            response = requests.get(url, headers=headers, params=querystring, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            formatted_results = []
            # We gracefully handle standard nested array names used by RapidAPI providers
            items = data.get("videos", data.get("items", data.get("data", data.get("results", []))))
            
            for item in items[:max_results]:
                # Handle varying video ID locations
                video_id = item.get("videoId", item.get("id", ""))
                if isinstance(video_id, dict):
                    video_id = video_id.get("videoId", "")
                    
                title = item.get("title", "YouTube Video")
                description = item.get("description", item.get("snippet", ""))
                provider = item.get("channelTitle", item.get("channel", item.get("author", "YouTube")))
                
                formatted_results.append(NormalizedResource(
                    id=f"youtube_{video_id}",
                    title=title,
                    description=description,
                    provider=provider,
                    source="youtube_rapidapi",
                    url=f"https://www.youtube.com/watch?v={video_id}",
                    duration_hours=1.0, # YouTube search doesn't return duration directly, defaulting to 1 hr
                    difficulty_level=2,
                    skills=[query],
                    metadata={"channel_id": item.get("channelId", "")}
                ))
            return formatted_results
            
        except Exception as e:
            print(f"YouTube live acquisition failed: {e}")
            return []
