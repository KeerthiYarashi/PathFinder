from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from db.database import get_supabase
from supabase import Client

security = HTTPBearer(auto_error=True)

def verify_supabase_jwt(credentials: HTTPAuthorizationCredentials = Depends(security), db: Client = Depends(get_supabase)):
    """
    Dependency to verify a Supabase JWT token.
    Extracts the token from the Authorization header and verifies it with the Supabase Auth API.
    Returns the Supabase Auth User object on success.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    token = credentials.credentials
    try:
        # Use the Supabase client to get the user based on the JWT token
        user_response = db.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
