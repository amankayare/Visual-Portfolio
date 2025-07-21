import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///portfolio.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5000")
    RESUME_PATH = os.environ.get("RESUME_PATH", "../../assets/Aman Resume.pdf")
    ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "changeme")  # Legacy, not used with JWT
    JWT_SECRET = os.environ.get("JWT_SECRET", "changeme-jwt")
    ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "root")
    JWT_EXP_MINUTES = int(os.environ.get("JWT_EXP_MINUTES", 60))
