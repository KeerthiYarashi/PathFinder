from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "PathFinder API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "https://pathfinder-frontend-4vac.onrender.com"]

    # Supabase config
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_DB_URL: str = "" # PostgreSQL connection string for pgvector
    
    # LLM & AI config
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini" # "gemini" | "openai"
    EMBEDDING_MODEL: str = "models/gemini-embedding-2"
    VECTOR_COLLECTION: str = "learning_resources_hf"

    # Apify & External APIs
    APIFY_API_TOKEN: str = ""
    APIFY_COURSE_ACTOR_ID: str = ""
    APIFY_SEARCH_ACTOR_ID: str = ""
    YOUTUBE_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
