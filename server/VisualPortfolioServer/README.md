# Portfolio Backend (Flask)

## Features
- Modular Flask app with SOLID structure
- SQLAlchemy ORM (Postgres-ready, SQLite for dev)
- Marshmallow validation
- Secure CORS, rate limiting, logging
- Endpoints: Contact, Projects, Blogs, Certifications, About, Resume

## Setup
1. `python -m venv venv && source venv/bin/activate` (Linux/macOS) or `venv\Scripts\activate` (Windows)
2. `pip install -r requirements.txt`
3. Set environment variables as needed (see config.py)
4. `python app.py`

## Deployment
- Ready for Render, Railway, Fly.io, etc.
- Use Postgres in production, SQLite for local/dev

## Security
- CORS restricted
- Rate limiting
- Input validation

## Extendability
- Add new routes via blueprints
- Add new models/schemas in `models.py`/`schemas.py`
