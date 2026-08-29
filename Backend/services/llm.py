import os
from core.config import settings
from schemas.learner import ExtractedProfile
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

import re
from schemas.learner import SkillProficiency, LearningPreferences

class LLMService:
    def __init__(self, provider: str = settings.LLM_PROVIDER):
        self.provider = provider
        self.model = None
        if self.provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                self.model = ChatGoogleGenerativeAI(
                    model="gemini-3.5-flash",
                    google_api_key=settings.GEMINI_API_KEY,
                    temperature=0
                )
            except Exception as e:
                print(f"Warning: Could not initialize Gemini LLM: {e}")

    def _fallback_extract_from_text(self, resume_text: str, jd_text: str) -> ExtractedProfile:
        """
        Deterministic, robust NLP parser when LLM is unavailable or unconfigured.
        """
        # 1. Identify Target Role from JD or default
        target_role = "Software Engineer"
        jd_lower = jd_text.lower()
        
        role_candidates = [
            ("Doctor", ["doctor", "physician", "medicine", "surgeon", "clinical", "mbbs", "md"]),
            ("Nurse", ["nurse", "nursing", "patient care"]),
            ("Cybersecurity Specialist", ["cyber", "security", "infosec", "penetration", "soc"]),
            ("Product Manager", ["product manager", "product management", "pm", "product owner"]),
            ("UI/UX Designer", ["ui/ux", "ux designer", "ui designer", "figma", "graphic design"]),
            ("Data Scientist", ["data scientist", "machine learning", "deep learning", "ai engineer"]),
            ("Data Analyst", ["data analyst", "bi analyst", "tableau", "power bi", "data analysis"]),
            ("Full Stack Developer", ["full stack", "fullstack", "frontend", "backend", "web developer"]),
            ("Cloud Architect", ["cloud architect", "aws solutions", "devops", "kubernetes"]),
            ("Civil Engineer", ["civil engineer", "structural engineer", "autocad"]),
            ("Mechanical Engineer", ["mechanical engineer", "solidworks", "cad design"])
        ]
        
        for role_name, keywords in role_candidates:
            if any(k in jd_lower for k in keywords):
                target_role = role_name
                break

        # 2. Extract Candidate Name from Resume
        full_name = "Candidate"
        lines = [line.strip() for line in resume_text.split('\n') if line.strip()]
        if lines:
            # First line often contains the applicant name
            first_line = lines[0]
            if len(first_line.split()) <= 4 and not any(c in first_line for c in ['@', 'http', ':', '/', '\\']):
                full_name = first_line

        # 3. Extract Current Skills from Resume
        KNOWN_SKILLS = [
            "Python", "JavaScript", "TypeScript", "React", "Node.js", "Java", "C++", "SQL",
            "PostgreSQL", "Docker", "Kubernetes", "AWS", "Git", "Machine Learning", "Deep Learning",
            "Pandas", "NumPy", "PyTorch", "TensorFlow", "HTML", "CSS", "Tailwind",
            "Anatomy", "Pathology", "Pharmacology", "Diagnostics", "Patient Care", "Triage",
            "Network Security", "Cryptography", "Penetration Testing", "Linux",
            "Figma", "User Research", "Wireframing", "Prototyping",
            "Product Strategy", "Agile", "Scrum", "Market Research", "Financial Modeling"
        ]
        
        detected_skills = []
        resume_lower = resume_text.lower()
        for skill in KNOWN_SKILLS:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', resume_lower):
                detected_skills.append(SkillProficiency(
                    skill=skill,
                    proficiency="Intermediate",
                    evidence=f"Mentioned in resume credentials"
                ))

        if not detected_skills:
            detected_skills = [
                SkillProficiency(skill="Core Fundamentals", proficiency="Beginner", evidence="Foundational level")
            ]

        # 4. Extract Required Skills from JD
        required_skills = []
        for skill in KNOWN_SKILLS:
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', jd_lower):
                required_skills.append(skill)

        if not required_skills:
            required_skills = [f"{target_role} Core Competency", "System Architecture", "Applied Problem Solving"]

        return ExtractedProfile(
            full_name=full_name,
            current_role="Applicant",
            target_role=target_role,
            target_industry="Technology & Professional Services",
            current_skills=detected_skills,
            required_skills=required_skills[:5],
            preferred_skills=[],
            learning_preferences=LearningPreferences(weekly_hours=10, difficulty="normal")
        )

    def extract_profile(self, conversation: list[dict]) -> ExtractedProfile:
        if self.model:
            try:
                structured_model = self.model.with_structured_output(ExtractedProfile)
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "Extract a learner profile from the following conversation. Map the learner's goals to one of these target roles: 'role_ml_engineer', 'role_data_analyst', 'role_fullstack_dev', 'role_cloud_architect'. Assign skill mastery levels (0=None, 1=Beginner, 2=Intermediate, 3=Advanced) based on their background. If not mentioned, time_budget_hours is 5 and difficulty_tolerance is 'normal'."),
                    ("placeholder", "{messages}")
                ])
                chain = prompt | structured_model
                return chain.invoke({"messages": conversation})
            except Exception as e:
                print(f"LLM extract_profile warning: {e}")
                
        user_text = " ".join([m.get("content", "") for m in conversation if m.get("role") == "user"])
        return self._fallback_extract_from_text(user_text, user_text)

    def extract_profile_from_resume_jd(self, resume_text: str, jd_text: str) -> ExtractedProfile:
        if self.model:
            try:
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
            except Exception as e:
                print(f"LLM extract_profile_from_resume_jd error, falling back to heuristic: {e}")

        return self._fallback_extract_from_text(resume_text, jd_text)

    def generate_explanation(self, scoring_data: dict, learner_context: dict) -> str:
        if self.model:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are an AI learning mentor. Explain why this specific resource was recommended based ONLY on the following scoring data and learner context. Mention the exact percentages or factors. Keep it to one short, encouraging paragraph."),
                    ("user", "Scoring data: {scoring_data}\nLearner context: {learner_context}")
                ])
                chain = prompt | self.model | StrOutputParser()
                return chain.invoke({"scoring_data": scoring_data, "learner_context": learner_context})
            except Exception:
                pass
        return "Recommended based on comprehensive alignment with your target career goals, preferred media format, and skill gap priority."

    def generate_followup_question(self, partial_profile: dict) -> str:
        if self.model:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are an AI learning mentor. The following learner profile is incomplete. Ask ONE concise, friendly follow-up question to clarify their target role, existing skills, or time budget. Do not list all missing fields, just ask a natural conversational question."),
                    ("user", "Partial profile: {partial_profile}")
                ])
                chain = prompt | self.model | StrOutputParser()
                return chain.invoke({"partial_profile": partial_profile})
            except Exception:
                pass
        return "What is your primary career target or the specific skill you want to master next?"

    def chat_with_context(self, messages: list[dict], system_prompt: str) -> str:
        if self.model:
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", system_prompt),
                    ("placeholder", "{messages}")
                ])
                chain = prompt | self.model | StrOutputParser()
                return chain.invoke({"messages": messages})
            except Exception:
                pass
        return "I am your AI learning mentor. Let's work together to master your target skills and build your portfolio."

    def generate_search_queries(self, missing_skills: list[str], target_role: str) -> dict[str, str]:
        """
        Generates contextual search queries for each missing skill.
        Returns a dict mapping skill_name -> search_query
        """
        if self.model:
            try:
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
            except Exception as e:
                print(f"LLM generate_search_queries warning: {e}")

        # Reliable heuristic fallback
        return {skill: f"{skill} beginner tutorial course {target_role}" for skill in missing_skills}
