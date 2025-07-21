from flask import Blueprint, request, jsonify, current_app
from utils.jwt_auth import create_jwt_token
from models import User, db
from datetime import datetime
from schemas import UserRegistrationSchema, UserLoginSchema
from marshmallow import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/token', methods=['POST'])
def get_token():
    """Get JWT token for admin (requires HTTP Basic Auth)
    ---
    tags:
      - Auth
    security:
      - BasicAuth: []
    responses:
      200:
        description: JWT token issued
        content:
          application/json:
            schema:
              type: object
              properties:
                access_token:
                  type: string
      401:
        description: Invalid credentials
    """
    from flask import request
    import base64
    auth = request.authorization
    admin_user = current_app.config.get('ADMIN_USERNAME', 'admin')
    admin_pass = current_app.config.get('ADMIN_PASSWORD', 'adminpass')
    if not auth or not auth.username or not auth.password:
        return jsonify({'error': 'Missing or invalid Basic Auth credentials'}), 401
    if auth.username == admin_user and auth.password == admin_pass:
        token = create_jwt_token(identity=auth.username)
        return jsonify({'access_token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - email
            - password
          properties:
            username:
              type: string
              description: Username
            email:
              type: string
              description: Email address
            password:
              type: string
              description: Password
    responses:
      201:
        description: User registered successfully
      400:
        description: Validation error or user already exists
    """
    try:
        schema = UserRegistrationSchema()
        data = schema.load(request.json)
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: Username or email
            password:
              type: string
              description: Password
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    try:
        schema = UserLoginSchema()
        data = schema.load(request.json)
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == data['username']) | 
            (User.email == data['username'])
        ).first()
        
        if user and user.check_password(data['password']):
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            token = create_jwt_token(identity=user.username, user_id=user.id, is_admin=user.is_admin)
            return jsonify({
                'access_token': token,
                'user': user.to_dict(),
                'message': 'Login successful'
            }), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user info
    ---
    tags:
      - Auth
    security:
      - Bearer: []
    responses:
      200:
        description: Current user info
      401:
        description: Authentication required
    """
    from utils.jwt_auth import jwt_required, get_current_user_id
    
    @jwt_required
    def _get_user():
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        if user:
            return jsonify({'user': user.to_dict()}), 200
        return jsonify({'error': 'User not found'}), 404
    
    return _get_user()
