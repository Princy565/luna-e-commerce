from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from models import db, User, Address
from config import Config

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'success': False, 'message': 'Authentication token is missing'}), 401

        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                return jsonify({'success': False, 'message': 'User not found'}), 401
            g.current_user = current_user
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Session expired. Please log in again.'}), 401
        except Exception as e:
            return jsonify({'success': False, 'message': 'Invalid authentication token'}), 401

        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'success': False, 'message': 'Admin token missing'}), 401

        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            if not user or user.role != 'admin':
                return jsonify({'success': False, 'message': 'Admin privileges required'}), 403
            g.current_user = user
        except Exception:
            return jsonify({'success': False, 'message': 'Invalid or expired admin token'}), 401

        return f(*args, **kwargs)
    return decorated

def generate_token(user):
    payload = {
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email address is already registered'}), 409

    hashed_pw = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password_hash=hashed_pw,
        phone=phone,
        role='customer',
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={name.replace(' ', '')}"
    )

    db.session.add(new_user)
    db.session.commit()

    token = generate_token(new_user)
    return jsonify({
        'success': True,
        'message': 'Account created successfully',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': 'Invalid email address or password'}), 401

    token = generate_token(user)
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    return jsonify({
        'success': True,
        'user': g.current_user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json() or {}
    user = g.current_user

    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url'].strip()

    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({'success': False, 'message': 'New password must be at least 6 characters'}), 400
        user.password_hash = generate_password_hash(data['password'])

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

# Address Management
@auth_bp.route('/addresses', methods=['GET'])
@token_required
def get_addresses():
    addresses = Address.query.filter_by(user_id=g.current_user.id).order_by(Address.is_default.desc(), Address.id.desc()).all()
    return jsonify({
        'success': True,
        'addresses': [addr.to_dict() for addr in addresses]
    }), 200

@auth_bp.route('/addresses', methods=['POST'])
@token_required
def add_address():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()
    street = data.get('street', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    postal_code = data.get('postal_code', '').strip()
    is_default = data.get('is_default', False)

    if not all([full_name, phone, street, city, state, postal_code]):
        return jsonify({'success': False, 'message': 'All address fields are required'}), 400

    # If first address or marked default, set all others to non-default
    count = Address.query.filter_by(user_id=g.current_user.id).count()
    if count == 0 or is_default:
        Address.query.filter_by(user_id=g.current_user.id).update({'is_default': False})
        is_default = True

    new_addr = Address(
        user_id=g.current_user.id,
        full_name=full_name,
        phone=phone,
        street=street,
        city=city,
        state=state,
        postal_code=postal_code,
        country=data.get('country', 'India'),
        is_default=is_default
    )
    db.session.add(new_addr)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Address added successfully',
        'address': new_addr.to_dict()
    }), 201

@auth_bp.route('/addresses/<int:address_id>', methods=['PUT'])
@token_required
def update_address(address_id):
    addr = Address.query.filter_by(id=address_id, user_id=g.current_user.id).first()
    if not addr:
        return jsonify({'success': False, 'message': 'Address not found'}), 404

    data = request.get_json() or {}
    if 'full_name' in data: addr.full_name = data['full_name']
    if 'phone' in data: addr.phone = data['phone']
    if 'street' in data: addr.street = data['street']
    if 'city' in data: addr.city = data['city']
    if 'state' in data: addr.state = data['state']
    if 'postal_code' in data: addr.postal_code = data['postal_code']
    if 'country' in data: addr.country = data['country']

    if data.get('is_default'):
        Address.query.filter_by(user_id=g.current_user.id).update({'is_default': False})
        addr.is_default = True

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Address updated successfully',
        'address': addr.to_dict()
    }), 200

@auth_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@token_required
def delete_address(address_id):
    addr = Address.query.filter_by(id=address_id, user_id=g.current_user.id).first()
    if not addr:
        return jsonify({'success': False, 'message': 'Address not found'}), 404

    db.session.delete(addr)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Address deleted successfully'}), 200
