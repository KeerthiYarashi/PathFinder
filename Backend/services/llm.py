import os
from core.config import settings
from schemas.learner import ExtractedProfile
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class LLMService:
    def __init__(self, provider: str = settings.LLM_PROVIDER):
        self.provider = provider
        if self.provider == "gemini":
            self.model = ChatGoogleGenerativeAI(
                model="gemini-3.5-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")

    def extract_profile(self, conversation: list[dict]) -> ExtractedProfile:
        structured_model = self.model.with_structured_output(ExtractedProfile)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Extract a learner profile from the following conversation. Map the learner's goals to one of these target roles: 'role_ml_engineer', 'role_data_analyst', 'role_fullstack_dev', 'role_cloud_architect'. Assign skill mastery levels (0=None, 1=Beginner, 2=Intermediate, 3=Advanced) based on their background. If not mentioned, time_budget_hours is 5 and difficulty_tolerance is 'normal'."),
            ("placeholder", "{messages}")
        ])
        
        chain = prompt | structured_model
        return chain.invoke({"messages": conversation})

    def extract_profile_from_resume_jd(self, resume_text: str, jd_text: str) -> ExtractedProfile:
        structured_model = self.model.with_structured_output(ExtractedProfile)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert career and learning advisor. Extract a rich learner profile from the provided Resume and Job Description.
STRICT RULES:
1. NEVER hallucinate information. If the candidate's actual full name is not present, leave `full_name` as null. DO NOT use placeholders like "Demo Learner" or "John Doe".
2. Keep Resume data and Job Description data STRICTLY SEPARATE.
   - `current_skills` must ONLY come from the Resume.
   - `required_skills` and `preferred_skills` must ONLY come from the Job Description.
3. For `current_skills`, assign a proficiency level ("Beginner", "Intermediate", "Advanced", or "Unknown") and extract the explicit `evidence` from the resume that justifies this level (e.g., "Built 3 projects using Python", "Used FastAPI at Company X").
4. If preferences are not mentioned, provide sensible defaults (e.g. 10 weekly hours, mixed media)."""),
            ("user", "Resume Text:\n{resume}\n\nJob Description:\n{jd}")
        ])
        
        chain = prompt | structured_model
        return chain.invoke({"resume": resume_text, "jd": jd_text})

    def generate_explanation(self, scoring_data: dict, learner_context: dict) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI learning mentor. Explain why this specific resource was recommended based ONLY on the following scoring data and learner context. Mention the exact percentages or factors. Keep it to one short, encouraging paragraph."),
            ("user", "Scoring data: {scoring_data}\nLearner context: {learner_context}")
        ])
        chain = prompt | self.model | StrOutputParser()
        return chain.invoke({"scoring_data": scoring_data, "learner_context": learner_context})

    def generate_followup_question(self, partial_profile: dict) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an AI learning mentor. The following learner profile is incomplete. Ask ONE concise, friendly follow-up question to clarify their target role, existing skills, or time budget. Do not list all missing fields, just ask a natural conversational question."),
            ("user", "Partial profile: {partial_profile}")
        ])
        chain = prompt | self.model | StrOutputParser()
        return chain.invoke({"partial_profile": partial_profile})

    def chat_with_context(self, messages: list[dict], system_prompt: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("placeholder", "{messages}")
        ])
        chain = prompt | self.model | StrOutputParser()
        return chain.invoke({"messages": messages})

    def generate_search_queries(self, missing_skills: list[str], target_role: str) -> dict[str, str]:
        """
        Generates contextual search queries for each missing skill.
        Returns a dict mapping skill_name -> search_query
        """
        # We need a structured output to map skill to query reliably
        from pydantic import BaseModel
        class SkillQueries(BaseModel):
            queries: dict[str, str]

        structured_model = self.model.with_structured_output(SkillQueries)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert learning advisor. Given a target role and a list of missing skills, generate exactly ONE highly relevant, practical search query per missing skill to find tutorials, courses, or guides online. For example, if skill='Pandas' and role='Data Analyst', query might be 'Pandas data analysis beginner tutorial'. Return a mapping of skill name to the search query."),
            ("user", "Target Role: {role}\nMissing Skills: {skills}")
        ])
        
        chain = prompt | structured_model
        result = chain.invoke({"role": target_role, "skills": ", ".join(missing_skills)})
        return result.queries
