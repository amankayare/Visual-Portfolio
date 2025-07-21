from flask import Blueprint, send_file, current_app, abort
import os
from utils.jwt_auth import jwt_required

resume_bp = Blueprint('resume', __name__)

@resume_bp.route('/', methods=['GET'])
def get_resume():
    """Download resume PDF
    ---
    tags:
      - Resume

    responses:
      200:
        description: Resume PDF file
        content:
          application/pdf:
            schema:
              type: string
              format: binary
      404:
        description: Resume not found
    """
    resume_path = current_app.config.get("RESUME_PATH", "./resume.pdf")
    if not os.path.exists(resume_path):
        abort(404, description="Resume not found")
    return send_file(resume_path, as_attachment=True, download_name="Aman_Kayare_Resume.pdf")
