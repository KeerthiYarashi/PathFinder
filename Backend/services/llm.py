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
