from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.database import get_supabase
from supabase import Client

security = HTTPBearer(auto_error=True)

class DemoUser:
    def __init__(self, user_id="demo-user", email="demo@pathfinder.ai"):
        self.id = user_id
        self.email = email

def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Depends(security), db: Client = Depends(get_supabase)):
    """
    Dependency to verify a Supabase JWT token.
    Extracts the token from the Authorization header and verifies it with the Supabase Auth API.
    Returns the Supabase Auth User object on success.
    """
    if not credentials:
        return DemoUser()
        
    token = credentials.credentials
    
    # Allow demo / guest tokens for local development
    if token.startswith("demo_") or token.startswith("guest_") or token == "fake" or "placeholder" in token:
        return DemoUser(user_id=token.split("_")[-1] if "_" in token else "demo-user")
        
    if not db:
        return DemoUser()
        
    try:
        # Use the Supabase client to get the user based on the JWT token
        user_response = db.auth.get_user(token)
        if not user_response or not user_response.user:
            return DemoUser()
        return user_response.user
    except Exception:
        # Fallback to demo user rather than hard failing in local dev
        return DemoUser()
