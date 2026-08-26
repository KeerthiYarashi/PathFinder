import os
import requests
from typing import List, Dict

class CourseraScraperService:
    def __init__(self):
        # We assume the user will provide an Apify API token in the environment
        self.apify_token = os.environ.get("APIFY_API_TOKEN", "")
        self.actor_id = "reapxdev~coursera-scraper"

    def search_courses(self, query: str) -> List[Dict]:
        """
        Uses the reapxdev/coursera-scraper Apify actor to fetch courses.
        If no token is provided or the call fails, returns an empty list.
        """
        if not self.apify_token:
            print("Warning: APIFY_API_TOKEN not found. Skipping Coursera scraper fallback.")
            return []

        # Start the actor run
        run_url = f"https://api.apify.com/v2/acts/{self.actor_id}/runs?token={self.apify_token}"
        payload = {
            "query": query,
            "maxResults": 3
        }
        
        try:
            # 1. Trigger the run
            run_response = requests.post(run_url, json=payload)
            run_response.raise_for_status()
            run_data = run_response.json()
            default_dataset_id = run_data['data']['defaultDatasetId']
            
            # Note: In a real environment, we'd need to wait for the run to finish.
            # For a synchronous API fallback, this might timeout if the scraper is slow.
            # Assuming the actor returns quickly or we wait:
            # (In production, consider async polling or using pre-scraped data)
            
            import time
            status = "RUNNING"
            while status not in ["SUCCEEDED", "FAILED", "ABORTED"]:
                time.sleep(2)
                check_url = f"https://api.apify.com/v2/acts/{self.actor_id}/runs/{run_data['data']['id']}?token={self.apify_token}"
                status_res = requests.get(check_url).json()
                status = status_res['data']['status']
            
            if status != "SUCCEEDED":
                return []
                
            # 2. Fetch the results from the dataset
            dataset_url = f"https://api.apify.com/v2/datasets/{default_dataset_id}/items?token={self.apify_token}"
            items_response = requests.get(dataset_url)
            items_response.raise_for_status()
            items = items_response.json()
            
            # Format the output to match our Resource schema needs
            formatted_results = []
            for item in items:
                formatted_results.append({
                    "resource_id": f"coursera_{item.get('id', hash(item.get('title')))}",
                    "title": item.get("title", "Coursera Course"),
                    "description": item.get("description", "A course from Coursera"),
                    "url": item.get("url", ""),
                    "duration_hours": 10.0, # Defaulting if not provided
                    "difficulty_level": 2,  
                    "type": "course",
                    "skills_covered": query
                })
            return formatted_results
            
        except Exception as e:
            print(f"Coursera scraper fallback failed: {e}")
            return []
