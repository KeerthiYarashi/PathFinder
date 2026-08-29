import pytest
from engines.nba import NBAEngine

def test_nba_welcome_back_state():
    engine = NBAEngine()
    modules = [{"skill_id": "math_probability", "skill_name": "Probability", "status": "pending"}]
    # Inactivity > 7 days
    nba = engine.compute(modules, recent_scores=[0.8], is_behind_schedule=False, last_activity_days_ago=10)
    assert nba.type == "welcome_back"
    assert nba.module_id == "math_probability"

def test_nba_review_state():
    engine = NBAEngine()
    modules = [{"skill_id": "math_probability", "skill_name": "Probability", "status": "pending"}]
    # Recent score < 0.5
    nba = engine.compute(modules, recent_scores=[0.3], is_behind_schedule=False, last_activity_days_ago=1)
    assert nba.type == "review"
    assert "Review Recommended" in nba.title

def test_nba_priority_state():
    engine = NBAEngine()
    modules = [{"skill_id": "ml_basics", "skill_name": "ML", "status": "pending"}]
    # Behind schedule
    nba = engine.compute(modules, recent_scores=[0.7], is_behind_schedule=True, last_activity_days_ago=2)
    assert nba.type == "priority"
    assert "Catch Up Priority" in nba.title

def test_nba_celebrate_state():
    engine = NBAEngine()
    modules = [{"skill_id": "ml_basics", "skill_name": "ML", "status": "pending"}]
    # Score > 0.9
    nba = engine.compute(modules, recent_scores=[0.95], is_behind_schedule=False, last_activity_days_ago=1)
    assert nba.type == "celebrate"
    assert "Excellent Work" in nba.title

def test_nba_continue_default_state():
    engine = NBAEngine()
    modules = [
        {"skill_id": "mod_1", "skill_name": "Mod 1", "status": "completed"},
        {"skill_id": "mod_2", "skill_name": "Mod 2", "status": "pending"}
    ]
    # Normal on-track progress
    nba = engine.compute(modules, recent_scores=[0.8], is_behind_schedule=False, last_activity_days_ago=1)
    assert nba.type == "continue"
    assert nba.module_id == "mod_2"

def test_nba_all_completed():
    engine = NBAEngine()
    modules = [
        {"skill_id": "mod_1", "skill_name": "Mod 1", "status": "completed"}
    ]
    nba = engine.compute(modules, recent_scores=[], is_behind_schedule=False, last_activity_days_ago=1)
    assert nba.type == "celebrate"
    assert "Path Completed" in nba.title
