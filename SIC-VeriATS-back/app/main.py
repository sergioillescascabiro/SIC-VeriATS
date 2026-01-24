"""FastAPI application factory and main entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
# TODO: Create routers
from app import models  # Import models to register them with Base

# Trigger Reload
# from app.routers import auth, users, jobs, applications, candidates, validations

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="SIC-VeriATS API",
    description="Blind Hiring Platform - RESTful API for high-trust blind recruitment",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Ensure upload directory exists
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)

# Mount static files
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

from app.routers import auth, fair, candidates, company, admin

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(fair.router, tags=["Job Fair"])
app.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])
app.include_router(company.router, prefix="/company", tags=["Company"])

# Debug: Print all registered routes
print("\n" + "="*50)
print("REGISTERED ROUTES:")
for route in app.routes:
    if hasattr(route, 'path'):
        print(f"  {route.path} (Tags: {getattr(route, 'tags', [])})")
print("="*50 + "\n")
# app.include_router(users.router, prefix="/users", tags=["Users"])
# app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
# app.include_router(applications.router, prefix="/applications", tags=["Applications"])
# app.include_router(candidates.router, prefix="/candidates", tags=["Candidates (Blind)"])
# app.include_router(validations.router, prefix="/validations", tags=["Validations"])


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker healthcheck."""
    return {"status": "healthy", "service": "SIC-VeriATS API"}


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "message": "SIC-VeriATS Blind Hiring Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }
