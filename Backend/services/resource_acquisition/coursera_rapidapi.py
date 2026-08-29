import os
import requests
from typing import List
from core.config import settings
from services.resource_acquisition.base import NormalizedResource, ResourceAcquisitionClient

class CourseraRapidApiClient(ResourceAcquisitionClient):
    def __init__(self):
        # Allow passing it through env since it might not be in config yet
        self.api_key = os.getenv("RAPIDAPI_KEY", "")
        self.host = os.getenv("RAPIDAPI_HOST", "coursera-course-data-api.p.rapidapi.com")

    def acquire(self, query: str, max_results: int = 3) -> List[NormalizedResource]:
        if not self.api_key:
            print("Warning: RAPIDAPI_KEY not set. Skipping Coursera RapidAPI live acquisition.")
            return []
            
        print(f"CourseraLiveSearch: Searching RapidAPI for '{query}'")

        url = f"https://{self.host}/coursera/v1/search"
        headers = {
            "x-rapidapi-key": self.api_key,
            "x-rapidapi-host": self.host,
            "Content-Type": "application/json"
        }
        payload = {
            "query": query,
            "limit": max_results
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # The search endpoint might return items in 'data.courses' or just 'data' or 'courses'
            results_list = data.get("data", {}).get("courses", data.get("courses", []))
            
            formatted_results = []
            for item in results_list:
                course_id = item.get("id", "")
                
                # Parse provider from partners list if available
                partners = item.get("partners", [])
                provider = partners[0].get("name", "Coursera") if partners else "Coursera"
                
                # Parse difficulty
                diff_str = item.get("difficulty", "INTERMEDIATE").upper()
                if "BEGINNER" in diff_str:
                    diff_level = 1
                elif "ADVANCED" in diff_str:
                    diff_level = 3
                else:
                    diff_level = 2
                    
                # Extract URL securely
                url = item.get("url", f"https://www.coursera.org/learn/{item.get('slug', '')}")
                
                # Ensure we have the skill searched for, along with the course's skills
                course_skills = item.get("skills", [])
                if query not in course_skills:
                    course_skills.append(query)
                
                formatted_results.append(NormalizedResource(
                    id=f"coursera_{course_id}",
                    title=item.get("name", "Coursera Course"),
                    description=item.get("description", ""),
                    provider=provider,
                    source="coursera_rapidapi",
                    url=url,
                    duration_hours=float(item.get("duration", 20.0)), # Hard to parse textual workload reliably without regex, defaulting for now
                    difficulty_level=diff_level,
                    skills=course_skills,
                    metadata={"slug": item.get("slug", ""), "estimated_workload": item.get("estimated_workload", "")}
                ))
            return formatted_results
            
        except Exception as e:
            print(f"Coursera RapidAPI live acquisition failed: {e}")
            return []
