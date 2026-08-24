from typing import Dict, List
from schemas.path import SkillGap

# Mock Dataset: Target roles and their required skills/levels
# In a full production app, this would live in the database.
MOCK_ROLE_REQUIREMENTS = {
    "role_ml_engineer": {
        "math_probability": {"name": "Probability Theory", "target_level": 2},
        "python_pandas": {"name": "Pandas Data Manipulation", "target_level": 3},
        "ml_basics": {"name": "Machine Learning Fundamentals", "target_level": 3},
        "dl_neural_networks": {"name": "Deep Learning & Neural Nets", "target_level": 2}
    },
    "role_data_analyst": {
        "math_probability": {"name": "Probability Theory", "target_level": 1},
        "python_pandas": {"name": "Pandas Data Manipulation", "target_level": 3},
        "sql_basics": {"name": "SQL Fundamentals", "target_level": 3},
    }
}

def calculate_skill_gaps(target_role: str, current_skills: Dict[str, int]) -> List[SkillGap]:
    """
    Deterministic algorithm to compare what a learner has vs what a role requires.
    
    current_skills: Dictionary mapping skill_id to mastery_level (0 to 3)
    """
    if target_role not in MOCK_ROLE_REQUIREMENTS:
        # Default to a generic requirement if role is unknown
        required_skills = MOCK_ROLE_REQUIREMENTS["role_data_analyst"]
    else:
        required_skills = MOCK_ROLE_REQUIREMENTS[target_role]

    gaps = []

    for skill_id, req_data in required_skills.items():
        target_level = req_data["target_level"]
        skill_name = req_data["name"]
        
        # If the user doesn't have the skill in their dict, their level is 0
        current_level = current_skills.get(skill_id, 0)
        
        gap_size = target_level - current_level
        
        # If gap_size is <= 0, the user has already mastered this required skill!
        if gap_size > 0:
            # Determine priority based on gap size
            if gap_size == 3:
                priority = "high"
            elif gap_size == 2:
                priority = "medium"
            else:
                priority = "low"
                
            gaps.append(SkillGap(
                skill_id=skill_id,
                skill_name=skill_name,
                current_level=current_level,
                target_level=target_level,
                gap_size=gap_size,
                priority=priority
            ))
            
    # Sort gaps so highest priority (largest gap) is first
    gaps.sort(key=lambda x: x.gap_size, reverse=True)
    
    return gaps
