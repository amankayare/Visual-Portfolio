from flask import Blueprint, request, jsonify
from models import ContactMessage, db
from utils.security import sanitize_input
from utils.jwt_auth import admin_required
from flask_limiter.util import get_remote_address
from flask_limiter import Limiter
import logging

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/admin/messages', methods=['GET'])
@admin_required
def get_contact_messages():
    """Get all contact messages (Admin only)
    ---
    tags:
      - Contact
    security:
      - Bearer: []
    responses:
      200:
        description: List of contact messages
      403:
        description: Admin access required
    """
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([m.to_dict() for m in messages]), 200

@contact_bp.route('/admin/messages/<int:message_id>/mark-read', methods=['PUT'])
@admin_required
def mark_contact_message_read(message_id):
    """Mark a contact message as read (Admin only)
    ---
    tags:
      - Contact
    security:
      - Bearer: []
    parameters:
      - in: path
        name: message_id
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Message marked as read successfully
      404:
        description: Message not found
      403:
        description: Admin access required
    """
    try:
        message = ContactMessage.query.get_or_404(message_id)
        message.is_read = True
        db.session.commit()
        return jsonify({'message': 'Contact message marked as read successfully'}), 200
    except Exception:
        return jsonify({'error': 'Failed to mark message as read'}), 500

@contact_bp.route('/admin/messages/mark-all-read', methods=['PUT'])
@admin_required
def mark_all_contact_messages_read():
    """Mark all contact messages as read (Admin only)
    ---
    tags:
      - Contact
    security:
      - Bearer: []
    responses:
      200:
        description: All messages marked as read successfully
      403:
        description: Admin access required
    """
    try:
        ContactMessage.query.filter_by(is_read=False).update({'is_read': True})
        db.session.commit()
        return jsonify({'message': 'All contact messages marked as read successfully'}), 200
    except Exception:
        return jsonify({'error': 'Failed to mark messages as read'}), 500

@contact_bp.route('/admin/messages/<int:message_id>', methods=['DELETE'])
@admin_required
def delete_contact_message(message_id):
    """Delete a contact message (Admin only)
    ---
    tags:
      - Contact
    security:
      - Bearer: []
    parameters:
      - in: path
        name: message_id
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Message deleted successfully
      404:
        description: Message not found
      403:
        description: Admin access required
    """
    try:
        message = ContactMessage.query.get_or_404(message_id)
        db.session.delete(message)
        db.session.commit()
        return jsonify({'message': 'Contact message deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete message'}), 500


@contact_bp.route('/', methods=['POST'])
def submit_contact():
    """Send a contact message
    ---
    tags:
      - Contact
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
            - message
          properties:
            name:
              type: string
              description: Sender's name
            email:
              type: string
              description: Sender's email
            subject:
              type: string
              description: Subject
            message:
              type: string
              description: Message body
            phone:
              type: string
              description: Sender's phone number
            preferred_contact_method:
              type: string
              description: Preferred contact method (email/phone/other)
    security: []  # Explicitly mark this endpoint as public in Swagger
    responses:
      201:
        description: Message sent
      400:
        description: Validation error
    """
    data = request.json
    # Sanitize input to prevent XSS
    name = sanitize_input(data.get('name', ''))
    email = sanitize_input(data.get('email', ''))
    subject = sanitize_input(data.get('subject', ''))
    message = sanitize_input(data.get('message', ''))
    phone = sanitize_input(data.get('phone', ''))
    preferred_contact_method = sanitize_input(data.get('preferred_contact_method', ''))

    contact = ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message,
        phone=phone,
        preferred_contact_method=preferred_contact_method
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify(contact.to_dict()), 201
