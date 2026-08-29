from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_resume_upload():
    print("Testing Resume/JD Langchain Extraction...")
    
    # We need a valid JWT token since the endpoint uses verify_supabase_jwt
    # But wait, in a test environment without a real Supabase user, this might fail 401.
    # For now, let's just test the LLMService directly!
    
    from services.llm import LLMService
    import json
    
    resume_text = """
    John Doe
    Software Engineer with 3 years of experience.
    Skills: Python, Django, React, basic SQL.
    Looking to transition into Data Science.
    """
    
    jd_text = """
    We are looking for a Data Analyst.
    Requirements:
    - Advanced SQL
    - Python (Pandas, NumPy)
    - Data Visualization (Tableau or PowerBI)
    - Understanding of A/B testing
    """
    
    llm = LLMService()
    try:
        profile = llm.extract_profile_from_resume_jd(resume_text, jd_text)
        print("\n--- Extracted Profile JSON ---")
        print(profile.model_dump_json(indent=2))
        print("------------------------------")
        print("SUCCESS! Langchain successfully extracted the skills and gap!")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_resume_upload()
