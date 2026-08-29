import pytest
from unittest.mock import MagicMock, patch
from engines.adaptive import handle_struggling_action, handle_complete_action

def test_handle_complete_action():
    mock_db = MagicMock()
    msg = handle_complete_action(learner_id="learner_1", skill_id="python_basics", db=mock_db)
    
    assert "Successfully mastered python_basics" in msg
    mock_db.table.assert_called_with("learner_skills")
    mock_db.table().upsert.assert_called_with({
        "learner_id": "learner_1",
        "skill_id": "python_basics",
        "mastery_level": 3
    })

def test_handle_struggling_action_with_prereqs():
    mock_db = MagicMock()
    
    # Mock prerequisite query returning level 3
    mock_db.table().select().eq().eq().execute.return_value.data = [{"mastery_level": 3}]
    
    with patch("engines.adaptive.get_prerequisites") as mock_prereqs, \
         patch("engines.adaptive.generate_learner_timeline") as mock_gen_timeline:
        
        mock_prereqs.return_value = {"ml_basics": ["math_probability"]}
        mock_timeline = MagicMock()
        mock_timeline.model_dump.return_value = {"weeks": []}
        mock_gen_timeline.return_value = mock_timeline
        
        result = handle_struggling_action(learner_id="learner_1", skill_id="ml_basics", db=mock_db)
        
        assert "Downgraded prerequisite 'math_probability' to level 2" in result
        assert "The path has been recalculated" in result

def test_handle_struggling_action_no_prereqs():
    mock_db = MagicMock()
    
    with patch("engines.adaptive.get_prerequisites") as mock_prereqs:
        mock_prereqs.return_value = {}
        
        result = handle_struggling_action(learner_id="learner_1", skill_id="python_basics", db=mock_db)
        assert "has no prerequisites to refresh" in result
