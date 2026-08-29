from supabase import create_client, Client
from core.config import settings

# Initialize Supabase client safely
supabase: Client | None = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")
        supabase = None

def get_supabase() -> Client | None:
    """Dependency to get the Supabase client instance"""
    return supabase

