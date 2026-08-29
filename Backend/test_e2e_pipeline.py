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

from schemas.learner import ExtractedProfile, SkillProficiency, LearningPreferences
from api.v1.onboarding import shared_learning_pipeline
from services.resource_acquisition.base import NormalizedResource

# Mock VectorStoreService and Clients to avoid real API calls during unit test
class MockVectorStoreService:
    def __init__(self):
        self.added_resources = []
        
    def add_resources(self, resources):
        self.added_resources.extend(resources)
        
    def search_resources(self, skill_name, k=10, **kwargs):
        return [
            NormalizedResource(
                id=f"res_{skill_name}_mock",
                title=f"Mastering {skill_name}",
                provider="Coursera",
                format="video",
                skill_tag=skill_name,
                url=f"https://coursera.org/{skill_name}",
                difficulty="intermediate",
                time_estimate_hours=3.0,
                rating=4.8,
                reviews_count=120,
                cost="free"
            )
        ]

class MockLLMService:
    def generate_explanation(self, resource_title, role, skill):
        return f"This course teaches {skill} which is critical for {role}."

class MockApifyClient:
    def search_coursera(self, query, limit=5):
        return []

class MockYouTubeClient:
    def search_videos(self, query, max_results=5):
        return []

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
        current_skills=[
            SkillProficiency(skill="python", proficiency="Advanced", evidence="3 years Python"),
            SkillProficiency(skill="sql", proficiency="Beginner", evidence="1 year SQL")
        ],
        required_skills=["python", "sql", "docker", "fastapi"],
        learning_preferences=LearningPreferences(weekly_hours=10.0, difficulty="high")
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
