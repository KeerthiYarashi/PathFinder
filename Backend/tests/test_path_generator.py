import pytest
from engines.path_generator import topological_sort_skills, generate_timeline
from schemas.path import SkillGap

# We use the MOCK_PREREQUISITES from engines/path_generator.py:
# "ml_basics": ["math_probability", "python_pandas"]

def test_topological_sort():
    # Provide gaps out of order
    gaps = [
        SkillGap(skill_id="ml_basics", skill_name="Machine Learning", current_level=1, target_level=3, gap_size=2, priority="medium"),
        SkillGap(skill_id="math_probability", skill_name="Probability", current_level=0, target_level=3, gap_size=3, priority="high"),
        SkillGap(skill_id="python_pandas", skill_name="Pandas", current_level=2, target_level=3, gap_size=1, priority="low")
    ]
    
    sorted_gaps = topological_sort_skills(gaps)
    
    # math_probability and python_pandas MUST come before ml_basics
    ml_index = next(i for i, g in enumerate(sorted_gaps) if g.skill_id == "ml_basics")
    math_index = next(i for i, g in enumerate(sorted_gaps) if g.skill_id == "math_probability")
    pandas_index = next(i for i, g in enumerate(sorted_gaps) if g.skill_id == "python_pandas")
    
    assert math_index < ml_index
    assert pandas_index < ml_index

class MockRecommendedResource:
    def __init__(self, skill_id, skill_name):
        self.resource_id = f"mock_{skill_id}"
        self.title = skill_name
        self.duration_hours = 2.0
        self.difficulty_level = 2
        self.url = ""
        self.format_type = "video"
        self.explanation_summary = "mock"
        
        class MockScoring:
            def model_dump(self): return {}
        self.scoring = MockScoring()

class MockRecommendationEngine:
    def get_best_resource_for_gap(self, gap, learner_profile, learner_mastery, reward_history=None):
        return MockRecommendedResource(gap.skill_id, gap.skill_name)

def test_topological_sort_independent_nodes():
    # Independent nodes preserve valid output without breaking
    gaps = [
        SkillGap(skill_id="docker_basics", skill_name="Docker", current_level=0, target_level=2, gap_size=2, priority="medium"),
        SkillGap(skill_id="git_basics", skill_name="Git", current_level=0, target_level=2, gap_size=2, priority="medium")
    ]
    sorted_gaps = topological_sort_skills(gaps)
    assert len(sorted_gaps) == 2

def test_timeline_variable_budgets():
    gaps = [
        SkillGap(skill_id="math_probability", skill_name="Probability", current_level=0, target_level=3, gap_size=3, priority="high"),
        SkillGap(skill_id="python_pandas", skill_name="Pandas", current_level=2, target_level=3, gap_size=1, priority="low"),
        SkillGap(skill_id="ml_basics", skill_name="Machine Learning", current_level=1, target_level=3, gap_size=2, priority="medium")
    ]
    mock_engine = MockRecommendationEngine()
    
    # 1. Very small budget (1.5 hours/week) -> Each 2.0 hr module gets its own week
    timeline_small = generate_timeline("learner_1", "role_ml", gaps, 1.5, "normal", mock_engine, {})
    assert timeline_small.total_weeks == 3
    assert len(timeline_small.weeks) == 3
    
    # 2. Large budget (10.0 hours/week) -> All 3 modules fit in week 1
    timeline_large = generate_timeline("learner_2", "role_ml", gaps, 10.0, "normal", mock_engine, {})
    assert timeline_large.total_weeks == 1
    assert len(timeline_large.weeks[0].modules) == 3

