from flask import Blueprint, request, jsonify
from models import Blog, db


from utils.security import sanitize_input
from utils.jwt_auth import jwt_required, admin_required

blogs_bp = Blueprint('blogs', __name__)


@blogs_bp.route('/', methods=['GET'])
def get_blogs():
    """List all visible blogs
    ---
    tags:
      - Blogs
    responses:
      200:
        description: List of visible blogs
    """
    blogs = Blog.query.filter_by(is_visible=True).order_by(Blog.date.desc()).all()
    return jsonify([b.to_dict() for b in blogs]), 200

@blogs_bp.route('/admin', methods=['GET'])
@admin_required
def get_all_blogs():
    """List all blogs (including hidden ones) - Admin only
    ---
    tags:
      - Blogs
    security:
      - Bearer: []
    responses:
      200:
        description: List of all blogs
      403:
        description: Admin access required
    """
    blogs = Blog.query.order_by(Blog.date.desc()).all()
    return jsonify([b.to_dict() for b in blogs]), 200

@blogs_bp.route('/<int:blog_id>', methods=['GET'])
def get_blog(blog_id):
    """Get a single blog post by ID
    ---
    tags:
      - Blogs
    parameters:
      - in: path
        name: blog_id
        required: true
        schema:
          type: integer
    responses:
      200:
        description: Blog post details
      404:
        description: Blog not found
    """
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    return jsonify(blog.to_dict()), 200

@blogs_bp.route('/', methods=['POST'])
@admin_required
def create_blog():
    """Create a new blog
    ---
    tags:
      - Blogs
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - title
            - content
            - date
            - tags
            - author
          properties:
            title:
              type: string
              description: Blog post title
            excerpt:
              type: string
              description: Short summary
            content:
              type: string
              description: Blog content
            cover_image:
              type: string
              description: Cover image URL
            date:
              type: string
              format: date
              description: Publication date (YYYY-MM-DD)
            reading_time:
              type: integer
              description: Estimated reading time (minutes)
            featured:
              type: boolean
              description: Featured blog flag
            tags:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                    description: Tag ID
                  name:
                    type: string
                    description: Tag name
              description: List of tag objects
            author:
              type: object
              properties:
                id:
                  type: integer
                  description: Author ID
                name:
                  type: string
                  description: Author name
              description: Author object
    responses:
      201:
        description: Blog created
    """
    try:
        data = request.json
        # Handle tags and author fields
        title = sanitize_input(data.get('title', ''))
        excerpt = sanitize_input(data.get('excerpt', ''))
        content = sanitize_input(data.get('content', ''))
        cover_image = sanitize_input(data.get('cover_image', ''))
        from datetime import datetime
        date_str = data.get('date')
        date = None
        if date_str:
            try:
                date = datetime.fromisoformat(date_str)
            except Exception:
                date = None
        reading_time = data.get('reading_time')
        featured = bool(data.get('featured', False))
        # Tags: expects a list of objects (with at least name or id)
        tags = []
        tag_objs = data.get('tags', [])
        if isinstance(tag_objs, list):
            from models import Tag, db
            for tag_obj in tag_objs:
                if isinstance(tag_obj, dict):
                    tag_id = tag_obj.get('id')
                    tag_name = tag_obj.get('name')
                else:
                    tag_id = None
                    tag_name = str(tag_obj)
                tag = None
                if tag_id:
                    tag = Tag.query.get(tag_id)
                if not tag and tag_name:
                    tag = Tag.query.filter_by(name=tag_name).first()
                if not tag and tag_name:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                if tag:
                    tags.append(tag)
        # Author: expects an object (with at least id or name)
        author = None
        author_obj = data.get('author')
        if isinstance(author_obj, dict):
            author_id = author_obj.get('id')
            author_name = author_obj.get('name')
            from models import Author, db
            if author_id:
                author = Author.query.get(author_id)
            if not author and author_name:
                author = Author.query.filter_by(name=author_name).first()
            if not author and author_name:
                author = Author(name=author_name)
                db.session.add(author)

        blog = Blog(
            title=title,
            excerpt=sanitize_input(data.get('excerpt', '')),
            content=content,
            cover_image=sanitize_input(data.get('cover_image', '')),
            date=date,
            reading_time=data.get('reading_time'),
            featured=bool(data.get('featured', False)),
            author=author,
            tags=tags
        )
        db.session.add(blog)
        db.session.commit()
        return jsonify(blog.to_dict()), 201
    except Exception as err:
        return jsonify({"errors": str(err)}), 400

@blogs_bp.route('/<int:blog_id>', methods=['PUT'])
@admin_required
def update_blog(blog_id):
    """Update a blog by ID
    ---
    tags:
      - Blogs
    security:
      - Bearer: []
    parameters:
      - in: path
        name: blog_id
        schema:
          type: integer
        required: true
        description: Blog ID
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
              description: Blog post title
            content:
              type: string
              description: Blog content
            date:
              type: string
              format: date
              description: Publication date (YYYY-MM-DD)
            tags:
              type: array
              items:
                type: string
              description: List of tags
            author:
              type: string
              description: Author name
    responses:
      200:
        description: Blog updated
      404:
        description: Blog not found
    """
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    try:
        data = request.json
        from datetime import datetime
        for field in ['title', 'excerpt', 'content', 'cover_image']:
            if field in data:
                setattr(blog, field, sanitize_input(data[field]))
        if 'reading_time' in data:
            blog.reading_time = data['reading_time']
        if 'featured' in data:
            blog.featured = bool(data['featured'])
        # Handle date
        if 'date' in data:
            date_str = data['date']
            try:
                blog.date = datetime.fromisoformat(date_str)
            except Exception:
                pass
        # Handle tags
        if 'tags' in data:
            tag_names = list(set(data['tags'])) if isinstance(data['tags'], list) else []
            tags = []
            from models import Tag, db
            for tag_name in tag_names:
                tag = Tag.query.filter_by(name=tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.session.add(tag)
                tags.append(tag)
            blog.tags = tags
        # Handle author
        if 'author' in data:
            author_name = data['author']
            from models import Author, db
            author = Author.query.filter_by(name=author_name).first()
            if not author:
                author = Author(name=author_name)
                db.session.add(author)
            blog.author = author
        db.session.commit()
        return jsonify(blog.to_dict()), 200
    except Exception as err:
        return jsonify({"errors": str(err)}), 400

@blogs_bp.route('/<int:blog_id>', methods=['DELETE'])
@jwt_required
def delete_blog(blog_id):
    """Delete a blog by ID
    ---
    tags:
      - Blogs
    security:
      - Bearer: []
    parameters:
      - in: path
        name: blog_id
        schema:
          type: integer
        required: true
        description: Blog ID
    security:
      - Bearer: []
    responses:
      204:
        description: Blog deleted
      404:
        description: Blog not found
    """
    blog = Blog.query.get(blog_id)
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    db.session.delete(blog)
    db.session.commit()
    return '', 204
