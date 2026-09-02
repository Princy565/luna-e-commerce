from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='customer') # 'customer' or 'admin'
    phone = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    addresses = db.relationship('Address', backref='user', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy=True)
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    wishlist_items = db.relationship('WishlistItem', backref='user', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    street = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    country = db.Column(db.String(50), default='India')
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'street': self.street,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'country': self.country,
            'is_default': self.is_default
        }

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    icon_name = db.Column(db.String(50), nullable=True)
    products = db.relationship('Product', backref='category_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'image_url': self.image_url,
            'icon_name': self.icon_name,
            'product_count': len(self.products) if self.products else 0
        }

class Brand(db.Model):
    __tablename__ = 'brands'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    logo_url = db.Column(db.String(500), nullable=True)
    products = db.relationship('Product', backref='brand_rel', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'logo_url': self.logo_url,
            'product_count': len(self.products) if self.products else 0
        }

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    slug = db.Column(db.String(255), nullable=False, unique=True, index=True)
    brand_id = db.Column(db.Integer, db.ForeignKey('brands.id', ondelete='SET NULL'), nullable=True)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='SET NULL'), nullable=True)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float, nullable=False)
    discount_percent = db.Column(db.Integer, default=0)
    stock = db.Column(db.Integer, default=50)
    rating = db.Column(db.Float, default=4.5)
    review_count = db.Column(db.Integer, default=0)
    is_featured = db.Column(db.Boolean, default=False)
    is_trending = db.Column(db.Boolean, default=False)
    is_new = db.Column(db.Boolean, default=False)
    is_flash_deal = db.Column(db.Boolean, default=False)
    flash_deal_end = db.Column(db.DateTime, nullable=True)
    main_image = db.Column(db.String(500), nullable=False)
    images_json = db.Column(db.Text, nullable=True) # JSON list of URLs
    colors_json = db.Column(db.Text, nullable=True) # JSON list of color hex/names
    sizes_json = db.Column(db.Text, nullable=True)  # JSON list of sizes
    specs_json = db.Column(db.Text, nullable=True)  # JSON key-value pairs
    three_d_model = db.Column(db.String(100), nullable=True) # Type of 3D preview: 'cyber_watch', 'audio_pod', 'neon_orb', etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    reviews = db.relationship('Review', backref='product_rel', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, full=False):
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'brand': self.brand_rel.name if self.brand_rel else 'LUNA Exclusive',
            'brand_id': self.brand_id,
            'category': self.category_rel.name if self.category_rel else 'General',
            'category_slug': self.category_rel.slug if self.category_rel else 'general',
            'category_id': self.category_id,
            'description': self.description,
            'price': self.price,
            'original_price': self.original_price,
            'discount_percent': self.discount_percent,
            'stock': self.stock,
            'in_stock': self.stock > 0,
            'rating': round(self.rating, 1) if self.rating else 4.5,
            'review_count': self.review_count,
            'is_featured': self.is_featured,
            'is_trending': self.is_trending,
            'is_new': self.is_new,
            'is_flash_deal': self.is_flash_deal,
            'flash_deal_end': self.flash_deal_end.isoformat() if self.flash_deal_end else None,
            'main_image': self.main_image,
            'three_d_model': self.three_d_model or 'cyber_watch',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if full:
            data['images'] = json.loads(self.images_json) if self.images_json else [self.main_image]
            data['colors'] = json.loads(self.colors_json) if self.colors_json else []
            data['sizes'] = json.loads(self.sizes_json) if self.sizes_json else []
            data['specs'] = json.loads(self.specs_json) if self.specs_json else {}
        else:
            data['images'] = json.loads(self.images_json) if self.images_json else [self.main_image]
        return data

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    selected_color = db.Column(db.String(50), nullable=True)
    selected_size = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'selected_color': self.selected_color,
            'selected_size': self.selected_size,
            'product': self.product.to_dict() if self.product else None
        }

class WishlistItem(db.Model):
    __tablename__ = 'wishlist_items'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Coupon(db.Model):
    __tablename__ = 'coupons'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    discount_percent = db.Column(db.Integer, nullable=False)
    min_purchase = db.Column(db.Float, default=0.0)
    max_discount = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    expires_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'discount_percent': self.discount_percent,
            'min_purchase': self.min_purchase,
            'max_discount': self.max_discount,
            'is_active': self.is_active
        }

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    address_json = db.Column(db.Text, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0.0)
    coupon_code = db.Column(db.String(50), nullable=True)
    shipping_fee = db.Column(db.Float, default=0.0)
    tax = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False) # 'CARD', 'UPI', 'COD'
    payment_status = db.Column(db.String(50), default='COMPLETED') # 'PENDING', 'COMPLETED', 'FAILED'
    payment_id = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='PLACED') # 'PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
    tracking_timeline_json = db.Column(db.Text, nullable=True)
    estimated_delivery = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'address': json.loads(self.address_json) if self.address_json else {},
            'subtotal': self.subtotal,
            'discount': self.discount,
            'coupon_code': self.coupon_code,
            'shipping_fee': self.shipping_fee,
            'tax': self.tax,
            'total': self.total,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'payment_id': self.payment_id,
            'status': self.status,
            'tracking_timeline': json.loads(self.tracking_timeline_json) if self.tracking_timeline_json else [],
            'estimated_delivery': self.estimated_delivery,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'items': [item.to_dict() for item in self.items]
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='SET NULL'), nullable=True)
    product_title = db.Column(db.String(255), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    selected_color = db.Column(db.String(50), nullable=True)
    selected_size = db.Column(db.String(50), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_title': self.product_title,
            'price': self.price,
            'quantity': self.quantity,
            'selected_color': self.selected_color,
            'selected_size': self.selected_size,
            'image_url': self.image_url,
            'item_total': round(self.price * self.quantity, 2)
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1 - 5
    title = db.Column(db.String(200), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    verified_purchase = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'verified_purchase': self.verified_purchase,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
