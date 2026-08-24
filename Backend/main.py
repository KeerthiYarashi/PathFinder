from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

from api.v1 import learner

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
def health_check():
    """
    Health check endpoint to verify API is running
    """
    return {"status": "ok", "service": settings.PROJECT_NAME}

# API Routers
app.include_router(learner.router, prefix=f"{settings.API_V1_STR}/learners", tags=["learners"])
# app.include_router(onboarding.router, prefix=f"{settings.API_V1_STR}/onboarding", tags=["onboarding"])
# app.include_router(path.router, prefix=f"{settings.API_V1_STR}/paths", tags=["paths"])
