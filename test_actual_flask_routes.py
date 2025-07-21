#!/usr/bin/env python3
"""
Test the actual Flask routes in the same context as the running server
"""
import os
import sys

# Change to the same directory as run.py does
flask_dir = os.path.join(os.path.dirname(__file__), 'server', 'VisualPortfolioServer')
os.chdir(flask_dir)
sys.path.insert(0, flask_dir)

from app import app
from models import TechnicalSkill, Experience
from flask import Flask

def test_flask_routes():
    """Test Flask routes in the same context as the running server"""
    with app.app_context():
        print("=== TESTING IN ACTUAL FLASK APP CONTEXT ===")
        print(f"Working directory: {os.getcwd()}")
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Test technical skills
        print(f"\n--- Technical Skills in Flask Context ---")
        all_skills = TechnicalSkill.query.order_by(TechnicalSkill.order).all()
        print(f"Total skills: {len(all_skills)}")
        
        for skill in all_skills[:5]:  # Show first 5
            print(f"  ID: {skill.id}, Title: {skill.title}, Visible: {skill.is_visible}")
        
        if len(all_skills) > 5:
            print(f"  ... and {len(all_skills) - 5} more")
        
        # Test experiences
        print(f"\n--- Experiences in Flask Context ---")
        all_experiences = Experience.query.order_by(Experience.order.desc(), Experience.start_date.desc()).all()
        print(f"Total experiences: {len(all_experiences)}")
        
        for exp in all_experiences:
            print(f"  ID: {exp.id}, Title: {exp.title}, Visible: {exp.is_visible}")
        
        # Test the queries that should be used in routes
        print(f"\n--- Testing Route Queries ---")
        
        # Admin query (should return all)
        admin_skills = TechnicalSkill.query.order_by(TechnicalSkill.order).all()
        admin_exp = Experience.query.order_by(Experience.order.desc(), Experience.start_date.desc()).all()
        
        print(f"Admin skills query: {len(admin_skills)} items")
        print(f"Admin experiences query: {len(admin_exp)} items")
        
        # Public query (should return only visible)
        public_skills = TechnicalSkill.query.filter_by(is_visible=True).order_by(TechnicalSkill.order).all()
        public_exp = Experience.query.filter_by(is_visible=True).order_by(Experience.order.desc(), Experience.start_date.desc()).all()
        
        print(f"Public skills query: {len(public_skills)} items")
        print(f"Public experiences query: {len(public_exp)} items")

if __name__ == "__main__":
    test_flask_routes()