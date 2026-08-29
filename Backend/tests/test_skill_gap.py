import pytest
from engines.skill_gap import calculate_skill_gaps

def test_calculate_skill_gaps_partial_skills():
    target_role = "role_ml_engineer"
    current_skills = {
        "python_basics": 4,  # Needed 4, has 4 -> No gap
        "ml_basics": 1,      # Needed 3, has 1 -> Gap of 2
        "math_probability": 0 # Needed 3, has 0 -> Gap of 3
    }
    
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

def test_calculate_skill_gaps_zero_skills():
    # User starting with completely clean slate
    target_role = "role_frontend_developer"
    current_skills = {}
    gaps = calculate_skill_gaps(target_role, current_skills)
    assert len(gaps) > 0
    # All gaps should be positive and sorted descending by gap_size
    for i in range(len(gaps) - 1):
        assert gaps[i].gap_size >= gaps[i+1].gap_size

def test_calculate_skill_gaps_expert_learner():
    # User exceeds all requirements
    target_role = "role_data_analyst"
    current_skills = {
        "math_probability": 1,
        "python_basics": 2,
        "python_pandas": 3,
        "sql_basics": 3,
        "sql_advanced": 2
    }
    gaps = calculate_skill_gaps(target_role, current_skills)
    assert len(gaps) == 0

def test_calculate_skill_gaps_custom_jd():
    # User matching against specific JD required skills
    jd_skills = {
        "PyTorch": 3,
        "Docker": 2,
        "Kubernetes": 1
    }
    current_skills = {
        "pytorch": 1,
        "docker": 2
    }
    gaps = calculate_skill_gaps("custom_role", current_skills, jd_required_skills=jd_skills)
    
    assert len(gaps) == 2
    gap_ids = [g.skill_id for g in gaps]
    assert "pytorch" in gap_ids
    assert "kubernetes" in gap_ids
    assert "docker" not in gap_ids

def test_calculate_skill_gaps_unknown_role_fallback():
    # Fallback to default role
    gaps = calculate_skill_gaps("non_existent_role_xyz", {})
    assert len(gaps) > 0

def test_six_domain_roles_coverage():
    # 1. Technology: AI Engineer
    ai_gaps = calculate_skill_gaps("AI Engineer", {})
    assert any("python" in g.skill_id for g in ai_gaps)
    assert any("ml" in g.skill_id or "machine" in g.skill_id for g in ai_gaps)

    # 2. Business: Product Manager
    pm_gaps = calculate_skill_gaps("Product Manager", {})
    assert any("product_discovery" in g.skill_id for g in pm_gaps)

    # 3. Finance: Financial Analyst
    fin_gaps = calculate_skill_gaps("Financial Analyst", {})
    assert any("financial_accounting" in g.skill_id or "financial_modeling" in g.skill_id for g in fin_gaps)

    # 4. Creative: UI/UX Designer
    ux_gaps = calculate_skill_gaps("UI/UX Designer", {})
    assert any("design" in g.skill_id or "figma" in g.skill_id or "wireframing" in g.skill_id for g in ux_gaps)

    # 5. Marketing: Digital Marketing Specialist
    mkt_gaps = calculate_skill_gaps("Digital Marketing Specialist", {})
    assert any("marketing" in g.skill_id or "seo" in g.skill_id for g in mkt_gaps)

    # 6. Healthcare: Healthcare Data Analyst
    health_gaps = calculate_skill_gaps("Healthcare Data Analyst", {})
    assert any("ehr" in g.skill_id or "health" in g.skill_id or "biostatistics" in g.skill_id for g in health_gaps)

def test_quiz_score_differentiation_same_role():
    # User A scores 90% in Python -> has level 3 -> gap size 0 (skipped)
    user_a_skills = {"python_basics": 3}
    gaps_a = calculate_skill_gaps("AI Engineer", user_a_skills)
    python_gap_a = next((g for g in gaps_a if g.skill_id == "python_basics"), None)
    assert python_gap_a is None  # Skipped from gaps because mastered!

    # User B scores 30% in Python -> has level 0 -> gap size 3 (foundational module needed)
    user_b_skills = {"python_basics": 0}
    gaps_b = calculate_skill_gaps("AI Engineer", user_b_skills)
    python_gap_b = next((g for g in gaps_b if g.skill_id == "python_basics"), None)
    assert python_gap_b is not None
    assert python_gap_b.gap_size == 3
    assert python_gap_b.priority == "high"

