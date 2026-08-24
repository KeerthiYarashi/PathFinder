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

def test_timeline_chunking():
    gaps = [
        SkillGap(skill_id="math_probability", skill_name="Probability", current_level=0, target_level=3, gap_size=3, priority="high"),
        SkillGap(skill_id="python_pandas", skill_name="Pandas", current_level=2, target_level=3, gap_size=1, priority="low"),
        SkillGap(skill_id="ml_basics", skill_name="Machine Learning", current_level=1, target_level=3, gap_size=2, priority="medium")
    ]
    
    # Generate timeline with a 5 hour per week budget
    timeline = generate_timeline("learner_123", "target_123", gaps, 5.0, "normal")
    
    # Since each course takes 2.0 hours, and budget is 5, we expect 2 courses in week 1, and 1 course in week 2
    # Total gaps = 3 -> Total weeks = 2
    assert timeline.total_weeks == 2
    assert len(timeline.weeks) == 2
    assert timeline.weeks[0].modules[0].skill_id == "math_probability"
