from schemas.nba import NextBestAction
from typing import List, Dict

class NBAEngine:
    def compute(
        self,
        modules: List[Dict],        # full ordered path modules
        recent_scores: List[float], # last 3 assessment scores
        is_behind_schedule: bool,
        last_activity_days_ago: int
    ) -> NextBestAction:
        
        # 1. Check for inactivity
        if last_activity_days_ago > 7:
            next_mod = self._get_next_incomplete(modules)
            return NextBestAction(
                type="welcome_back",
                title="Welcome Back!",
                description="It's been a while. Let's ease back into your learning path.",
                module_id=next_mod.get("skill_id") if next_mod else None
            )
            
        # 2. Check if struggling
        if recent_scores and recent_scores[-1] < 0.5:
            next_mod = self._get_next_incomplete(modules)
            return NextBestAction(
                type="review",
                title="Review Recommended",
                description="Your last score was low. It might help to review the prerequisite material.",
                module_id=next_mod.get("skill_id") if next_mod else None
            )
            
        # 3. Check if behind schedule
        if is_behind_schedule:
            next_mod = self._get_next_incomplete(modules)
            return NextBestAction(
                type="priority",
                title="Catch Up Priority",
                description="You are a bit behind schedule. Focus on this critical module.",
                module_id=next_mod.get("skill_id") if next_mod else None
            )
            
        # 4. Check for celebration
        if recent_scores and recent_scores[-1] > 0.9:
            next_mod = self._get_next_incomplete(modules)
            return NextBestAction(
                type="celebrate",
                title="Excellent Work!",
                description="You aced the last assessment. Keep the momentum going!",
                module_id=next_mod.get("skill_id") if next_mod else None
            )
            
        # 5. Default continue
        next_mod = self._get_next_incomplete(modules)
        if not next_mod:
            return NextBestAction(
                type="celebrate",
                title="Path Completed!",
                description="You have finished all modules in your path.",
                module_id=None
            )
            
        return NextBestAction(
            type="continue",
            title=f"Continue: {next_mod.get('skill_name', 'Next Module')}",
            description="You're on track. This is your next step.",
            module_id=next_mod.get("skill_id")
        )
        
    def _get_next_incomplete(self, modules: List[Dict]) -> Dict | None:
        for mod in modules:
            if mod.get("status", "pending") != "completed":
                return mod
        return None
