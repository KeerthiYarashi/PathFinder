from typing import Dict, List
from schemas.path import SkillGap

import json
import os

def get_role_requirements() -> Dict[str, Dict]:
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'skills.json')
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
            return data.get("roles", {})
    except Exception as e:
        print(f"Warning: Could not load skills.json: {e}")
        return {}

def calculate_skill_gaps(target_role: str, current_skills: Dict[str, int]) -> List[SkillGap]:
    """
    Deterministic algorithm to compare what a learner has vs what a role requires.
    
    current_skills: Dictionary mapping skill_id to mastery_level (0 to 3)
    """
    role_requirements = get_role_requirements()
    
    if target_role not in role_requirements:
        # Default to a generic requirement if role is unknown
        required_skills = role_requirements.get("role_data_analyst", {})
    else:
        required_skills = role_requirements[target_role]

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
