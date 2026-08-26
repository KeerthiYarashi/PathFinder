import os
import sys

# Add backend dir to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm import LLMService

def test_live_llm():
    try:
        print("Initializing LLM Service with Gemini...")
        llm = LLMService()
        
        conversation = [
            {"role": "assistant", "content": "Hi! What are your career goals and current skills?"},
            {"role": "user", "content": "I want to become an ML Engineer. I know basic python (I'd say intermediate) and some SQL, but I don't know any linear algebra or probability. I can study around 10 hours a week and prefer hard challenges."}
        ]
        
        print("\nSending conversation to Gemini for Profile Extraction (JSON mode)...")
        profile = llm.extract_profile(conversation)
        
        print("\n--- Gemini Extraction Result ---")
        print(profile.model_dump_json(indent=2))
        print("--------------------------------")
        
        print("\nTesting Explanation Generation...")
        scoring_data = {"semantic_similarity": 0.9, "time_fit": 0.8, "difficulty_fit": 1.0, "overall": 0.9}
        learner_context = {"target_role": "role_ml_engineer", "difficulty_tolerance": "high"}
        
        explanation = llm.generate_explanation(scoring_data, learner_context)
        print("\n--- Gemini Explanation Result ---")
        print(explanation)
        print("---------------------------------")
        
    except Exception as e:
        print(f"\nERROR: Failed to run live test. Details: {e}")

if __name__ == "__main__":
    test_live_llm()
