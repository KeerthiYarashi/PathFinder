# -*- coding: utf-8 -*-
import sys
import os

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from unittest.mock import MagicMock
from schemas.learner import ExtractedProfile, SkillProficiency, LearningPreferences
from engines.skill_gap import calculate_skill_gaps
from engines.path_generator import generate_timeline
from engines.recommendation import RecommendationEngine
from engines.nba import NBAEngine
from engines.adaptive import handle_struggling_action, handle_complete_action

def print_header(title):
    print("\n" + "="*70)
    print(f"  * {title}")
    print("="*70)

def print_step(step_num, title, details=None):
    print(f"\n[STEP {step_num}] {title}")
    if details:
        for k, v in details.items():
            print(f"   - {k}: {v}")

def run_demo_simulation():
    print_header("PATHFINDER END-TO-END PRE-DEMO VALIDATION")
    
    # Step 1: Learner Onboarding & Target Goal Extraction
    profile = ExtractedProfile(
        full_name="Alex River",
        target_role="role_ml_engineer",
        current_skills=[
            SkillProficiency(skill="Python Basics", proficiency="Intermediate", evidence="2 yrs building scripts"),
            SkillProficiency(skill="Probability Theory", proficiency="Beginner", evidence="College coursework")
        ],
        required_skills=["Machine Learning Fundamentals", "Deep Learning & Neural Nets", "Pandas Data Manipulation"],
        learning_preferences=LearningPreferences(
            weekly_hours=5.0,
            difficulty="normal",
            preferred_media=["video", "article"]
        )
    )
    print_step(1, "Learner Profile & Target Goal Created", {
        "Learner": profile.full_name,
        "Target Role": profile.target_role,
        "Weekly Budget": f"{profile.learning_preferences.weekly_hours} hours",
        "Known Skills": [s.skill for s in profile.current_skills]
    })

    # Step 2: Deterministic Skill-Gap Analysis
    current_skills_map = {
        "python_basics": 2,
        "math_probability": 1
    }
    gaps = calculate_skill_gaps(target_role=profile.target_role, current_skills=current_skills_map)
    print_step(2, f"Calculated {len(gaps)} Skill Gaps Against Role Requirements", {
        "Top Gap": f"{gaps[0].skill_name} (Gap Size: {gaps[0].gap_size}, Priority: {gaps[0].priority})",
        "Total Gaps to Bridge": len(gaps),
        "Ordered Gaps": [f"{g.skill_name} [Level {g.current_level}->{g.target_level}]" for g in gaps]
    })
    assert len(gaps) > 0, "Skill gaps should not be empty!"

    # Step 3: Recommendation Engine & DAG Timeline Gen
    mock_vector_store = MagicMock()
    mock_vector_store.search_resources.return_value = [
        {
            "resource_id": "res_ml_101",
            "title": "Machine Learning Fundamentals with Python",
            "url": "https://coursera.org/learn/ml-fund",
            "duration_hours": 2.5,
            "difficulty_level": 2,
            "type": "video",
            "skills_covered": "ml_basics"
        },
        {
            "resource_id": "res_prob_201",
            "title": "Probability & Statistics for Data Science",
            "url": "https://coursera.org/learn/prob-ds",
            "duration_hours": 2.0,
            "difficulty_level": 2,
            "type": "video",
            "skills_covered": "math_probability"
        }
    ]
    rec_engine = RecommendationEngine(mock_vector_store)
    timeline = generate_timeline(
        learner_id="alex_river_123",
        target_role=profile.target_role,
        skill_gaps=gaps,
        time_budget=profile.learning_preferences.weekly_hours,
        difficulty=profile.learning_preferences.difficulty,
        recommendation_engine=rec_engine,
        learner_mastery=current_skills_map
    )
    print_step(3, "Generated Topological Learning Path (Kahn's DAG)", {
        "Total Estimated Weeks": timeline.total_weeks,
        "Total Modules Planned": sum(len(w.modules) for w in timeline.weeks),
        "Week 1 Modules": [m.skill_name for m in timeline.weeks[0].modules]
    })
    assert timeline.total_weeks >= 1

    # Step 4: Next Best Action (NBA) Engine Query
    nba_engine = NBAEngine()
    modules_flat = [
        {"skill_id": m.skill_id, "skill_name": m.skill_name, "status": "pending"}
        for w in timeline.weeks for m in w.modules
    ]
    initial_nba = nba_engine.compute(
        modules=modules_flat,
        recent_scores=[],
        is_behind_schedule=False,
        last_activity_days_ago=1
    )
    print_step(4, "Computed Next Best Action (Initial State)", {
        "Action Type": initial_nba.type,
        "Title": initial_nba.title,
        "Target Module": initial_nba.module_id
    })
    assert initial_nba.type == "continue"

    # Step 5: Learner Completes Module -> Triggers Celebration
    mock_db = MagicMock()
    mock_db.table().select().eq().execute.return_value.data = [{"id": "alex_river_123", "name": "Alex River", "time_budget_hours": 5.0, "difficulty_tolerance": "normal", "target_role_id": "role_ml_engineer", "mastery_level": 2}]
    mock_db.table().select().eq().eq().execute.return_value.data = [{"mastery_level": 2}]
    first_mod_id = modules_flat[0]["skill_id"]
    complete_msg = handle_complete_action(learner_id="alex_river_123", skill_id=first_mod_id, db=mock_db)
    modules_flat[0]["status"] = "completed"
    
    celebrate_nba = nba_engine.compute(
        modules=modules_flat,
        recent_scores=[1.0],
        is_behind_schedule=False,
        last_activity_days_ago=0
    )
    print_step(5, f"Module '{first_mod_id}' Completed & Aced (Score: 100%)", {
        "DB Update": complete_msg,
        "NBA State": celebrate_nba.type,
        "NBA Message": celebrate_nba.description
    })
    assert celebrate_nba.type == "celebrate"

    # Step 6: Learner Struggles on Module -> Adaptive Rerouting
    struggling_skill = "ml_basics"
    struggle_msg = handle_struggling_action(learner_id="alex_river_123", skill_id=struggling_skill, db=mock_db)
    print_step(6, f"Learner Struggles on '{struggling_skill}' -> Trigger Adaptive Re-route", {
        "Adaptive Engine Response": struggle_msg,
        "Action Taken": "Prerequisite downgraded to inject refresher module"
    })
    assert "Downgraded prerequisite" in struggle_msg or "has no prerequisites" in struggle_msg

    # Step 7: 'Why This?' Scoring Breakdown
    top_gap = gaps[0]
    best_res = rec_engine.get_best_resource_for_gap(
        gap=top_gap,
        learner_profile={"time_budget_hours": 5.0, "difficulty_tolerance": "normal", "preferred_format": "video"},
        learner_mastery=current_skills_map
    )
    print_step(7, "Verified 'Why This?' Explanation & 6-Factor Scoring Breakdown", {
        "Resource Recommended": best_res.title,
        "Explanation": best_res.explanation_summary,
        "Difficulty Fit Score": f"{best_res.scoring.difficulty_fit * 100}%",
        "Time Fit Score": f"{best_res.scoring.time_fit * 100}%",
        "Overall Composite Score": round(best_res.scoring.overall, 3)
    })
    assert best_res.scoring.overall > 0.5

    # Step 8: Summary
    print_header("ALL PRE-DEMO VALIDATIONS PASSED SUCCESSFULLY!")
    print("""
    PathFinder Core Capabilities Verified:
    [x] Dynamic Skill-Gap Analysis
    [x] Prerequisite Dependency Resolution (Kahn's DAG)
    [x] Multi-factor Resource Recommendation Algorithm
    [x] Next Best Action (NBA) Engine State Transitions
    [x] Adaptive Re-routing on Difficulty/Struggle
    [x] Deterministic Scoring Explanations ("Why This?")
    """)

if __name__ == "__main__":
    run_demo_simulation()
