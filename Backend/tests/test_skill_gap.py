import pytest
from engines.skill_gap import calculate_skill_gaps

def test_calculate_skill_gaps():
    # Setup
    target_role = "role_ml_engineer"
    # User has some basics but misses advanced topics
    current_skills = {
        "python_basics": 4,  # Needed 4, has 4 -> No gap
        "ml_basics": 1,      # Needed 3, has 1 -> Gap of 2
        "math_probability": 0 # Needed 3, has 0 -> Gap of 3
    }
    
    # Execute
    gaps = calculate_skill_gaps(target_role, current_skills)
    
    assert len(gaps) == 5
    
    # Check Math gap
    math_gap = next((g for g in gaps if g.skill_id == "math_probability"), None)
    assert math_gap is not None
    assert math_gap.gap_size == 2
    assert math_gap.priority == "medium"
    
    # Check ML gap
    ml_gap = next((g for g in gaps if g.skill_id == "ml_basics"), None)
    assert ml_gap is not None
    assert ml_gap.gap_size == 2
    assert ml_gap.priority == "medium"
    
    # Check Pandas gap (implicitly 0 current)
    pandas_gap = next((g for g in gaps if g.skill_id == "python_pandas"), None)
    assert pandas_gap is not None
    assert pandas_gap.gap_size == 3
    assert pandas_gap.priority == "high"
    
    # Ensure no python_basics gap
    python_gap = next((g for g in gaps if g.skill_id == "python_basics"), None)
    assert python_gap is None
