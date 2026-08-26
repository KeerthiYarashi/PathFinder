from typing import List, Dict
from collections import deque
from schemas.path import SkillGap
from schemas.timeline import LearningTimeline, Week, Module

import json
import os

def get_prerequisites() -> Dict[str, List[str]]:
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'prerequisites.json')
    try:
        with open(data_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: Could not load prerequisites.json: {e}")
        return {}

def topological_sort_skills(skill_gaps: List[SkillGap]) -> List[SkillGap]:
    """
    Uses Kahn's Algorithm to sort skill gaps so prerequisites always come first.
    """
    # 1. Build the graph for the current gaps
    # Only include skills that the user actually needs to learn (the gaps)
    gap_skill_ids = {gap.skill_id for gap in skill_gaps}
    gap_dict = {gap.skill_id: gap for gap in skill_gaps}
    
    in_degree = {skill_id: 0 for skill_id in gap_skill_ids}
    adj_list = {skill_id: [] for skill_id in gap_skill_ids}
    
    for target, prereqs in get_prerequisites().items():
        if target in gap_skill_ids:
            for prereq in prereqs:
                if prereq in gap_skill_ids:
                    adj_list[prereq].append(target)
                    in_degree[target] += 1
                    
    # 2. Queue up all skills that have NO prerequisites (in-degree == 0)
    queue = deque([node for node in gap_skill_ids if in_degree[node] == 0])
    
    sorted_skills = []
    
    # 3. Process the queue
    while queue:
        # Sort queue by priority so if multiple skills are available, we pick the most critical
        # Highest priority first (gap size)
        current = sorted(list(queue), key=lambda x: gap_dict[x].gap_size, reverse=True)[0]
        queue.remove(current)
        
        sorted_skills.append(gap_dict[current])
        
        for neighbor in adj_list[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    # If there's a cycle, sorted_skills will be shorter than gap_skill_ids
    # In a real app we'd handle cycles, but assuming DAG for now
    
    # Append any isolated nodes that didn't get caught
    for gap in skill_gaps:
        if gap not in sorted_skills:
            sorted_skills.append(gap)
            
    return sorted_skills

def generate_timeline(
    learner_id: str, 
    target_role: str, 
    skill_gaps: List[SkillGap], 
    time_budget: float, 
    difficulty: str,
    recommendation_engine,
    learner_mastery: Dict[str, int]
) -> LearningTimeline:
    """
    Sorts gaps, fetches resources, and chunks them into weeks.
    """
    # 1. Sort skills topologically
    sorted_gaps = topological_sort_skills(skill_gaps)
    
    weeks: List[Week] = []
    current_week_modules = []
    current_week_hours = 0.0
    week_number = 1
    
    learner_profile = {
        "time_budget_hours": time_budget,
        "difficulty_tolerance": difficulty,
        "preferred_format": "video"
    }

    for gap in sorted_gaps:
        from schemas.timeline import Resource
        
        recommended = recommendation_engine.get_best_resource_for_gap(
            gap=gap,
            learner_profile=learner_profile,
            learner_mastery=learner_mastery
        )
        
        if recommended:
            best_resource = Resource(
                id=recommended.resource_id,
                title=recommended.title,
                time_estimate_hours=recommended.duration_hours,
                difficulty=str(recommended.difficulty_level),
                url=recommended.url,
                format_type=recommended.format_type,
                explanation_summary=recommended.explanation_summary,
                scoring_factors=recommended.scoring.model_dump()
            )
        else:
            # Fallback if vector store has no matches
            best_resource = Resource(
                id=f"fallback_{gap.skill_id}",
                title=f"Basics of {gap.skill_name}",
                time_estimate_hours=2.0,
                difficulty="normal"
            )
        
        est_hours = best_resource.time_estimate_hours
        
        module = Module(
            skill_id=gap.skill_id,
            skill_name=gap.skill_name,
            resource=best_resource,
            estimated_hours=est_hours
        )
        
        # Check if this module fits in the current week
        if current_week_hours + est_hours > time_budget and current_week_modules:
            # Pushes to next week
            weeks.append(Week(
                week_number=week_number, 
                modules=current_week_modules, 
                total_hours=current_week_hours
            ))
            week_number += 1
            current_week_modules = [module]
            current_week_hours = est_hours
        else:
            current_week_modules.append(module)
            current_week_hours += est_hours
            
    # Add final week
    if current_week_modules:
        weeks.append(Week(
            week_number=week_number, 
            modules=current_week_modules, 
            total_hours=current_week_hours
        ))
        
    return LearningTimeline(
        learner_id=learner_id,
        target_role=target_role,
        total_weeks=len(weeks),
        weeks=weeks
    )
