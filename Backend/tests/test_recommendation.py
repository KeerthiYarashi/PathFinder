import pytest
from unittest.mock import MagicMock
from engines.recommendation import RecommendationEngine
from schemas.path import SkillGap
from schemas.recommendation import ScoringBreakdown

def test_recommendation_scoring_formula():
    mock_vs = MagicMock()
    engine = RecommendationEngine(vector_store=mock_vs)
    
    gap = SkillGap(
        skill_id="python_basics",
        skill_name="Python Basics",
        current_level=0,
        target_level=2,
        gap_size=2,
        priority="medium"
    )
    
    candidate = {
        "resource_id": "res_123",
        "title": "Intro to Python",
        "duration_hours": 4.0,
        "difficulty_level": 2,
        "type": "video",
        "skills_covered": "python_basics"
    }
    
    learner = {
        "time_budget_hours": 5.0,
        "difficulty_tolerance": "normal",
        "preferred_format": "video"
    }
    
    overall, breakdown = engine._score_candidate(
        candidate=candidate,
        similarity_score=0.9,
        gap=gap,
        learner=learner,
        mastery={"python_basics": 0},
        rewards={"res_123": 0.8}
    )
    
    assert isinstance(breakdown, ScoringBreakdown)
    assert breakdown.semantic_similarity == 0.9
    assert breakdown.difficulty_fit == 1.0 # level 2 vs normal (2) -> diff 0 -> 1.0
    assert breakdown.time_fit == 1.0 # 4.0 hrs <= 5.0 budget -> 1.0
    assert breakdown.format_match == 1.0 # video == video -> 1.0
    assert breakdown.historical_reward == 0.8
    assert breakdown.prereq_readiness == 1.0
    
    # Check overall weighted sum:
    # 0.9*0.30 + 1.0*0.20 + 1.0*0.15 + 1.0*0.15 + 1.0*0.10 + 0.8*0.10 = 0.27 + 0.20 + 0.15 + 0.15 + 0.10 + 0.08 = 0.95
    assert round(overall, 2) == 0.95

def test_recommendation_deterministic_ranking():
    mock_vs = MagicMock()
    
    # Mock candidate search returning 2 options
    mock_vs.search_resources.return_value = [
        {
            "resource_id": "res_bad_fit",
            "title": "Super Advanced Python 40hr Course",
            "duration_hours": 40.0,
            "difficulty_level": 3,
            "type": "article",
            "skills_covered": "python"
        },
        {
            "resource_id": "res_perfect_fit",
            "title": "Python Quickstart for Beginners",
            "duration_hours": 3.0,
            "difficulty_level": 1,
            "type": "video",
            "skills_covered": "python"
        }
    ]
    
    engine = RecommendationEngine(vector_store=mock_vs)
    gap = SkillGap(skill_id="python", skill_name="Python", current_level=0, target_level=1, gap_size=1, priority="low")
    learner = {"time_budget_hours": 5.0, "difficulty_tolerance": "low", "preferred_format": "video"}
    
    best = engine.get_best_resource_for_gap(gap, learner, {})
    assert best is not None
    assert best.resource_id == "res_perfect_fit"
    assert "Recommended due to" in best.explanation_summary
