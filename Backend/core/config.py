from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "PathFinder API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Supabase config
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_DB_URL: str = "" # PostgreSQL connection string for pgvector
    
    # LLM & AI config
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    LLM_PROVIDER: str = "gemini" # "gemini" | "openai"
    EMBEDDING_MODEL: str = "models/text-embedding-004"
    VECTOR_COLLECTION: str = "learning_resources"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()
