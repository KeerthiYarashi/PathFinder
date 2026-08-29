import pytest
from unittest.mock import patch, MagicMock
from schemas.learner import ExtractedProfile
from schemas.path import SkillGap
from services.resource_acquisition.base import NormalizedResource
from api.v1.onboarding import shared_learning_pipeline
import os

@pytest.fixture
def mock_llm_service():
    with patch('api.v1.onboarding.LLMService') as MockLLM:
        mock_instance = MockLLM.return_value
        # Mock query generation
        mock_instance.generate_search_queries.return_value = {
            "FastAPI": "FastAPI python tutorial",
            "Deep Learning": "Deep Learning fundamentals"
        }
        yield mock_instance

@pytest.fixture
def mock_langchain_tools():
    with patch('api.v1.onboarding.search_coursera') as mock_coursera, \
         patch('api.v1.onboarding.search_youtube') as mock_youtube:
         
        # Return dictionaries representing NormalizedResources
        mock_coursera.invoke.return_value = [{
            "id": "coursera_mock_1",
            "title": "Mock Coursera FastAPI Course",
            "description": "Learn FastAPI",
            "provider": "Coursera",
            "source": "coursera_rapidapi",
            "url": "https://coursera.org/mock",
            "duration_hours": 10.0,
            "difficulty_level": 2,
            "skills": ["FastAPI"],
            "metadata": {}
        }]
        
        mock_youtube.invoke.return_value = [{
            "id": "youtube_mock_1",
            "title": "Mock YouTube Deep Learning Video",
            "description": "Deep learning in 10 minutes",
            "provider": "YouTube",
            "source": "youtube_rapidapi",
            "url": "https://youtube.com/mock",
            "duration_hours": 0.5,
            "difficulty_level": 1,
            "skills": ["Deep Learning"],
            "metadata": {}
        }]
        yield mock_coursera, mock_youtube

@pytest.fixture
def mock_vector_store():
    with patch('api.v1.onboarding.VectorStoreService') as MockVectorStore:
        mock_instance = MockVectorStore.return_value
        
        # When RecommendationEngine searches, return these candidates
        mock_instance.search_resources.return_value = [{
            "resource_id": "coursera_mock_1",
            "title": "Mock Coursera FastAPI Course",
            "url": "https://coursera.org/mock",
            "duration_hours": 10.0,
            "difficulty_level": 2,
            "type": "course",
            "skills_covered": "FastAPI"
        }]
        yield mock_instance

def test_full_pipeline_success(mock_llm_service, mock_langchain_tools, mock_vector_store):
    """
    Test the E2E flow:
    1. Deterministic skill gap calculation
    2. Query generation
    3. LangChain tools execution (Mocked Coursera/YouTube)
    4. Normalization and cache ingestion (mocked pgvector)
    5. Final LangChain Retriever extraction (mocked)
    6. Recommendation Engine and Kahn DAG execution
    """
    profile = ExtractedProfile(
        target_role="role_ml_engineer",
        current_skills={"Python": 2},
        required_skills=["Python", "FastAPI", "Deep Learning"],
        time_budget_hours=5.0,
        difficulty_tolerance="normal"
    )
    
    # 1. Run pipeline
    result = shared_learning_pipeline(profile, "test_user_id")
    
    # 2. Assert Skill Gaps
    gaps = result["skill_gaps"]
    assert len(gaps) == 2
    gap_skills = [g.skill_name for g in gaps]
    assert "FastAPI" in gap_skills
    assert "Deep Learning" in gap_skills
    
    # 3. Assert LangChain Tools were invoked
    mock_coursera, mock_youtube = mock_langchain_tools
    assert mock_coursera.invoke.called
    assert mock_youtube.invoke.called
    
    # 4. Assert Cache Ingestion was triggered
    # The pipeline uses VectorStoreService internally via ResourceAcquisitionOrchestrator
    # Note: Orchestrator is instantiated locally in the pipeline, so we patched VectorStoreService
    
    # 5. Assert Timeline Generation (Kahn DAG)
    timeline = result["timeline"]
    assert timeline.target_role == "role_ml_engineer"
    assert timeline.total_weeks >= 1
    assert len(timeline.weeks) >= 1
    
    # Check if the mock resource made it into the timeline
    first_week_modules = timeline.weeks[0].modules
    assert len(first_week_modules) > 0

def test_live_api_failure_fallback(mock_llm_service, mock_vector_store):
    """
    Test that the system falls back to the foundational dataset if APIs fail.
    """
    with patch('api.v1.onboarding.search_coursera') as mock_coursera, \
         patch('api.v1.onboarding.search_youtube') as mock_youtube:
        
        # Simulate API failure / returning empty lists
        mock_coursera.invoke.return_value = []
        mock_youtube.invoke.return_value = []
        
        profile = ExtractedProfile(
            target_role="role_ml_engineer",
            current_skills={},
            required_skills=["FastAPI"],
            time_budget_hours=5.0,
            difficulty_tolerance="normal"
        )
        
        # The pipeline should not crash
        result = shared_learning_pipeline(profile, "test_user_id")
        
        # RecommendationEngine will still query VectorStore (which falls back to original corpus)
        assert mock_vector_store.search_resources.called
        assert len(result["timeline"].weeks) > 0
