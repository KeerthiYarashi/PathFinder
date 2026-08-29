from schemas.recommendation import RecommendedResource, ScoringBreakdown
from schemas.path import SkillGap
from services.vector_store import VectorStoreService
from typing import Dict

class RecommendationEngine:
    def __init__(self, vector_store: VectorStoreService):
        self.vector_store = vector_store

    def get_best_resource_for_gap(
        self,
        gap: SkillGap,
        learner_profile: Dict,
        learner_mastery: Dict[str, int],
        reward_history: Dict[str, float] = None
    ) -> RecommendedResource | None:
        
        reward_history = reward_history or {}
        
        # 1. Semantic retrieval (top 10)
        candidates = self.vector_store.search_resources(skill_name=gap.skill_name, k=10)
        
        if not candidates:
            return None
            
        best_candidate = None
        best_score = -1
        best_scoring_breakdown = None
        
        for candidate in candidates:
            # Mock similarity score until we get real ones from vector store
            similarity_score = 0.85 
            
            final_score, breakdown = self._score_candidate(
                candidate=candidate,
                similarity_score=similarity_score,
                gap=gap,
                learner=learner_profile,
                mastery=learner_mastery,
                rewards=reward_history
            )
            
            if final_score > best_score:
                best_score = final_score
                best_candidate = candidate
                best_scoring_breakdown = breakdown
                
        if not best_candidate:
            return None
            
        explanation = self._generate_explanation_summary(best_scoring_breakdown)
        
        return RecommendedResource(
            resource_id=best_candidate["resource_id"],
            title=best_candidate["title"],
            description=best_candidate.get("description", ""),
            url=best_candidate.get("url", ""),
            duration_hours=float(best_candidate.get("duration_hours", 0)),
            difficulty_level=int(best_candidate.get("difficulty_level", 1)),
            format_type=best_candidate.get("type", "course"),
            skills_covered=best_candidate.get("skills_covered", "").split(","),
            scoring=best_scoring_breakdown,
            explanation_summary=explanation
        )

    def _score_candidate(self, candidate: Dict, similarity_score: float, gap: SkillGap, learner: Dict, mastery: Dict, rewards: Dict) -> tuple[float, ScoringBreakdown]:
        difficulty_fit = self._compute_difficulty_fit(
            int(candidate.get("difficulty_level", 1)), 
            learner.get("difficulty_tolerance", "normal")
        )
        time_fit = self._compute_time_fit(
            float(candidate.get("duration_hours", 1)), 
            float(learner.get("time_budget_hours", 5.0))
        )
        prereq_readiness = self._compute_prereq_readiness(candidate, mastery)
        format_match = self._compute_format_match(
            candidate.get("type", "course"), 
            learner.get("preferred_format", "video")
        )
        historical_reward = self._compute_historical_reward(candidate["resource_id"], rewards)
        
        overall = (
            similarity_score * 0.30 +
            prereq_readiness * 0.20 +
            difficulty_fit * 0.15 +
            time_fit * 0.15 +
            format_match * 0.10 +
            historical_reward * 0.10
        )
        
        breakdown = ScoringBreakdown(
            semantic_similarity=similarity_score,
            prereq_readiness=prereq_readiness,
            difficulty_fit=difficulty_fit,
            time_fit=time_fit,
            format_match=format_match,
            historical_reward=historical_reward,
            overall=overall
        )
        return overall, breakdown

    def _compute_difficulty_fit(self, resource_level: int, learner_tolerance: str) -> float:
        tol_map = {"low": 1, "normal": 2, "high": 3}
        learner_num = tol_map.get(learner_tolerance, 2)
        diff = abs(resource_level - learner_num)
        if diff == 0: return 1.0
        if diff == 1: return 0.7
        return 0.2

    def _compute_time_fit(self, resource_hours: float, weekly_budget: float) -> float:
        if resource_hours <= weekly_budget:
            return 1.0
        elif resource_hours <= weekly_budget * 2:
            return 0.7
        return 0.4

    def _compute_prereq_readiness(self, resource: Dict, mastery: Dict) -> float:
        return 1.0

    def _compute_format_match(self, resource_format: str, preferred: str) -> float:
        if preferred == "mixed": return 0.8
        if resource_format == preferred: return 1.0
        return 0.6

    def _compute_historical_reward(self, resource_id: str, rewards: Dict) -> float:
        return rewards.get(resource_id, 0.5)

    def _generate_explanation_summary(self, breakdown: ScoringBreakdown) -> str:
        factors = {
            "Time Fit": breakdown.time_fit,
            "Difficulty Fit": breakdown.difficulty_fit,
            "Format Match": breakdown.format_match
        }
        best_factor = max(factors.items(), key=lambda x: x[1])
        return f"Recommended due to strong {best_factor[0]} ({int(best_factor[1]*100)}%)."
