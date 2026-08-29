from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from db.database import get_supabase
from schemas.auth import AuthRequest, AuthResponse, OAuthResponse

router = APIRouter()

@router.post("/signup", response_model=AuthResponse)
def signup_user(request: AuthRequest, db: Client = Depends(get_supabase)):
    try:
        res = db.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        return AuthResponse(
            access_token=res.session.access_token if res.session else None,
            user_id=res.user.id,
            message="Signup successful! Check email for confirmation if required by Supabase settings."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=AuthResponse)
def login_user(request: AuthRequest, db: Client = Depends(get_supabase)):
    try:
        res = db.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        return AuthResponse(
            access_token=res.session.access_token,
            user_id=res.user.id,
            message="Login successful"
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/google", response_model=OAuthResponse)
def google_oauth(db: Client = Depends(get_supabase)):
    try:
        # Request OAuth URL from Supabase
        res = db.auth.sign_in_with_oauth({
            "provider": "google",
            "options": {
                "redirect_to": "http://localhost:3000/auth/callback" # Frontend URL
            }
        })
        return OAuthResponse(url=res.url, provider="google")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/github", response_model=OAuthResponse)
def github_oauth(db: Client = Depends(get_supabase)):
    try:
        res = db.auth.sign_in_with_oauth({
            "provider": "github",
            "options": {
                "redirect_to": "http://localhost:3000/auth/callback"
            }
        })
        return OAuthResponse(url=res.url, provider="github")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
