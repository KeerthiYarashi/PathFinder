import os
import sys

# Mock environment variables before importing
os.environ["SUPABASE_URL"] = "http://mock"
os.environ["SUPABASE_KEY"] = "mock"
os.environ["GEMINI_API_KEY"] = "mock"
os.environ["APIFY_API_TOKEN"] = "mock"
os.environ["YOUTUBE_API_KEY"] = "mock"

# Add Backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from schemas.learner import ExtractedProfile
from api.v1.onboarding import shared_learning_pipeline
from services.resource_acquisition.base import NormalizedResource

# Mock VectorStoreService and Clients to avoid real API calls during unit test
class MockVectorStoreService:
    def __init__(self):
        self.added_resources = []
        
    def add_resources(self, resources):
        self.added_resources.extend(resources)
        
    def search_resources(self, skill_name, k=10, **kwargs):
        # Return a mix of fake old and fake new
        return [
            {"resource_id": "coursera_123", "title": f"Old Coursera {skill_name}", "duration_hours": 10, "difficulty_level": 2},
            {"resource_id": f"apify_{skill_name}", "title": f"New Live {skill_name}", "duration_hours": 5, "difficulty_level": 2}
        ]

class MockApifyClient:
    def acquire(self, query, max_results=3):
        return [NormalizedResource(
            id=f"apify_{query}",
            title=f"Apify Result for {query}",
            description="Mock",
            provider="Apify",
            source="apify",
            url=f"http://apify.com/{query}",
            duration_hours=2.0,
            difficulty_level=2,
            skills=[query]
        )]

class MockYouTubeClient:
    def acquire(self, query, max_results=3):
        return [NormalizedResource(
            id=f"yt_{query}",
            title=f"YT Result for {query}",
            description="Mock",
            provider="YouTube",
            source="youtube",
            url=f"http://youtube.com/{query}",
            duration_hours=1.0,
            difficulty_level=2,
            skills=[query]
        )]

class MockLLMService:
    def generate_search_queries(self, missing_skills, target_role):
        return {skill: f"{skill} tutorial for {target_role}" for skill in missing_skills}

# Apply Mocks
import api.v1.onboarding
import services.resource_acquisition.service

api.v1.onboarding.VectorStoreService = lambda: MockVectorStoreService()
api.v1.onboarding.LLMService = lambda: MockLLMService()
services.resource_acquisition.service.ApifyClient = lambda: MockApifyClient()
services.resource_acquisition.service.YouTubeClient = lambda: MockYouTubeClient()

def test_pipeline():
    profile = ExtractedProfile(
        target_role="role_ml_engineer",
        current_skills={"python": 3, "sql": 1},
        required_skills={"python": 4, "sql": 3, "docker": 2, "fastapi": 2},
        time_budget_hours=10.0,
        difficulty_tolerance="high"
    )
    
    print("Running Shared Learning Pipeline...")
    result = shared_learning_pipeline(profile, "test_learner")
    
    print(f"\nExtracted Gaps: {len(result['skill_gaps'])}")
    for gap in result['skill_gaps']:
        print(f" - {gap.skill_name} (Gap: {gap.gap_size})")
        
    print(f"\nGenerated Timeline Weeks: {result['timeline'].total_weeks}")
    for week in result['timeline'].weeks:
        print(f"Week {week.week_number}: {week.total_hours} hrs")
        for module in week.modules:
            print(f" - {module.skill_name}: {module.resource.title} ({module.resource.id})")
            
    print("\nSUCCESS: The pipeline ran E2E with mocked live acquisition and RAG-Twice fallback.")

if __name__ == "__main__":
    test_pipeline()
