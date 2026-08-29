import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from main import app
from db.database import get_supabase
from core.security import verify_supabase_jwt

client = TestClient(app)

class MockUser:
    id = "test_user_123"
    email = "test@example.com"

@pytest.fixture(autouse=True)
def override_deps():
    mock_db = MagicMock()
    app.dependency_overrides[get_supabase] = lambda: mock_db
    app.dependency_overrides[verify_supabase_jwt] = lambda: MockUser()
    yield mock_db
    app.dependency_overrides.clear()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_learner_gaps(override_deps):
    mock_db = override_deps
    
    with patch("api.v1.path.analyze_learner_gaps") as mock_analyze:
        mock_analyze.return_value = {
            "learner_id": "test_user_123",
            "target_role": "role_ml_engineer",
            "total_gaps": 1,
            "gaps": [
                {
                    "skill_id": "math_probability",
                    "skill_name": "Probability",
                    "current_level": 0,
                    "target_level": 3,
                    "gap_size": 3,
                    "priority": "high"
                }
            ]
        }
        
        response = client.get("/api/v1/paths/gaps/test_user_123", headers={"Authorization": "Bearer fake"})
        assert response.status_code == 200
        data = response.json()
        assert data["target_role"] == "role_ml_engineer"
        assert len(data["gaps"]) == 1

def test_module_action_struggling(override_deps):
    mock_db = override_deps
    
    with patch("api.v1.modules.handle_struggling_action") as mock_struggle:
        mock_struggle.return_value = "Downgraded prerequisite"
        
        payload = {
            "learner_id": "test_user_123",
            "skill_id": "ml_basics",
            "action_type": "struggling"
        }
        response = client.post("/api/v1/modules/action", json=payload, headers={"Authorization": "Bearer fake"})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["requires_recalculation"] is True

def test_module_action_complete(override_deps):
    mock_db = override_deps
    
    with patch("api.v1.modules.handle_complete_action") as mock_complete:
        mock_complete.return_value = "Mastered"
        
        payload = {
            "learner_id": "test_user_123",
            "skill_id": "python_basics",
            "action_type": "complete"
        }
        response = client.post("/api/v1/modules/action", json=payload, headers={"Authorization": "Bearer fake"})
        assert response.status_code == 200
        assert response.json()["status"] == "success"

def test_module_action_skip():
    payload = {
        "learner_id": "test_user_123",
        "skill_id": "docker_basics",
        "action_type": "skip"
    }
    response = client.post("/api/v1/modules/action", json=payload, headers={"Authorization": "Bearer fake"})
    assert response.status_code == 200
    assert response.json()["requires_recalculation"] is False

def test_mentor_chat_fastpath(override_deps):
    mock_db = override_deps
    mock_db.table().select().eq().execute.return_value.data = [{"id": "test_user_123", "name": "Learner", "target_role_id": "role_ml_engineer"}]
    
    with patch("services.coursera_scraper.CourseraScraperService.search_courses") as mock_search:
        mock_search.return_value = [
            {"title": "Machine Learning Specialization", "description": "Top ML course", "url": "https://coursera.org/learn/ml"}
        ]
        
        payload = {
            "learner_id": "test_user_123",
            "message": "Can you recommend a course on Machine Learning?"
        }
        response = client.post("/api/v1/mentor/chat", json=payload, headers={"Authorization": "Bearer fake"})
        assert response.status_code == 200
        data = response.json()
        assert "Machine Learning Specialization" in data["response"]
        assert "coursera_scraper_fastpath" in data["tools_used"]
