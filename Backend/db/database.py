from supabase import create_client, Client
from core.config import settings

# Initialize a single, global client instance
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase() -> Client:
    """Dependency to get the Supabase client instance"""
    return supabase
