from flask import Flask, send_from_directory, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from config import Config
from routes.contact import contact_bp
from routes.projects import projects_bp
from routes.blogs import blogs_bp
from routes.certifications import certifications_bp
from routes.about import about_bp
from routes.resume import resume_bp
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.experiences import experiences_bp
from routes.technical_skills import technical_skills_bp
import logging
from flasgger import Swagger
import webbrowser
import threading
import time

# Initialize Flask app
app = Flask(__name__, 
            static_folder=os.path.abspath('../../dist/public'),
            static_url_path='')
app.config.from_object(Config)

# Setup CORS (restrict origins in production)
CORS(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}})

# Setup SQLAlchemy
from models import db
db.init_app(app)

# Setup Rate Limiting (increased for development)
#limiter = Limiter(get_remote_address, app=app, default_limits=["1000/minute"])

# Flasgger Swagger config
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec_1',
            "route": '/apispec_1.json',
            "rule_filter": lambda rule: True,  # include all endpoints
            "model_filter": lambda tag: True,  # include all models
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/portfolio"
}
swagger_template = {
    "info": {
        "title": "Portfolio Backend API",
        "description": "API documentation for Aman Kayare's portfolio backend.",
        "version": "1.0.0"
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "bearerFormat": "JWT",
            "description": "Paste only the JWT token value below. The server will prefix it with 'Bearer '."
        },
        "BasicAuth": {
            "type": "basic",
            "description": "HTTP Basic Authentication for /api/auth/token."
        }
    }
}
Swagger(app, config=swagger_config, template=swagger_template)

# Register Blueprints
app.register_blueprint(contact_bp, url_prefix="/api/contact")
app.register_blueprint(projects_bp, url_prefix="/api/projects")
app.register_blueprint(blogs_bp, url_prefix="/api/blogs")
app.register_blueprint(certifications_bp, url_prefix="/api/certifications")
app.register_blueprint(about_bp, url_prefix="/api/about")
app.register_blueprint(resume_bp, url_prefix="/api/resume")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(experiences_bp, url_prefix="/api/experiences")
app.register_blueprint(technical_skills_bp)

# Logging
logging.basicConfig(level=logging.INFO)

@app.route("/api/health")
def health():
    return {"status": "ok"}, 200

# Handle SPA routes explicitly
@app.route("/login")
@app.route("/register") 
@app.route("/admin")
@app.route("/admin/<path:admin_path>")
def serve_spa_routes(admin_path=None):
    """Serve React app for client-side routing"""
    return send_from_directory(app.static_folder, 'index.html')

# Serve React frontend static files
@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except FileNotFoundError:
        return {"error": "Frontend not built. Run 'npm run build' first."}, 404

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    """Serve static assets"""
    try:
        return send_from_directory(os.path.join(app.static_folder, 'assets'), filename)
    except FileNotFoundError:
        return {"error": "Asset not found"}, 404

@app.route('/<path:path>')
def serve_static_files(path):
    """Serve static files and handle client-side routing"""
    # API routes should not be handled here
    if path.startswith('api/'):
        return {"error": "API endpoint not found"}, 404
    
    # Check if it's a static file (has extension)
    if '.' in path:
        try:
            return send_from_directory(app.static_folder, path)
        except FileNotFoundError:
            return {"error": "File not found"}, 404
    else:
        # For client-side routing (other SPA routes), return index.html
        return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def handle_404(e):
    # Only serve index.html for non-API, non-static 404s
    requested_path = request.path
    # If the path looks like an API or static asset, return JSON 404
    if requested_path.startswith('/api/') or '.' in requested_path.split('/')[-1]:
        return {"error": "Not found"}, 404
    # Otherwise, serve the React app
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
