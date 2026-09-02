from flask import Blueprint, request, jsonify, g
import json
from datetime import datetime, timedelta
from models import db, User, Product, Category, Brand, Order, OrderItem, Review
from routes.auth import admin_required
from routes.orders import build_tracking_timeline
from sqlalchemy import func, desc

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_admin_statistics():
    total_revenue = db.session.query(func.sum(Order.total)).filter(Order.status != 'CANCELLED').scalar() or 0.0
    total_orders = Order.query.count()
    total_users = User.query.filter_by(role='customer').count()
    total_products = Product.query.count()
    low_stock_products = Product.query.filter(Product.stock <= 10).count()

    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(8).all()

    # Order status breakdown
    statuses = ['PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
    status_counts = {}
    for s in statuses:
        status_counts[s] = Order.query.filter_by(status=s).count()

    # Sales by category
    categories = Category.query.all()
    category_sales = []
    for cat in categories:
        prod_ids = [p.id for p in cat.products]
        cat_order_items = OrderItem.query.filter(OrderItem.product_id.in_(prod_ids)).all() if prod_ids else []
        cat_revenue = sum(item.price * item.quantity for item in cat_order_items)
        category_sales.append({
            'category': cat.name,
            'sales': round(cat_revenue, 2),
            'items_sold': sum(item.quantity for item in cat_order_items)
        })

    # Sales trend (last 7 days)
    sales_trend = []
    for i in range(6, -1, -1):
        day_date = (datetime.utcnow() - timedelta(days=i)).date()
        day_orders = Order.query.filter(
            func.date(Order.created_at) == day_date,
            Order.status != 'CANCELLED'
        ).all()
        day_rev = sum(o.total for o in day_orders)
        sales_trend.append({
            'date': day_date.strftime('%b %d'),
            'revenue': round(day_rev, 2),
            'orders': len(day_orders)
        })

    return jsonify({
        'success': True,
        'stats': {
            'total_revenue': round(total_revenue, 2),
            'total_orders': total_orders,
            'total_users': total_users,
            'total_products': total_products,
            'low_stock_count': low_stock_products,
            'status_breakdown': status_counts,
            'category_sales': category_sales,
            'sales_trend': sales_trend,
            'recent_orders': [o.to_dict() for o in recent_orders]
        }
    }), 200

# Product Management
@admin_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    if not title:
        return jsonify({'success': False, 'message': 'Product title is required'}), 400

    slug = data.get('slug') or title.lower().replace(' ', '-').replace('/', '-').replace('&', 'and')
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while Product.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    price = float(data.get('price', 0))
    original_price = float(data.get('original_price', price))
    discount_percent = int(data.get('discount_percent', 0))
    if original_price > price and discount_percent == 0:
        discount_percent = int(((original_price - price) / original_price) * 100)

    images = data.get('images', [])
    main_image = images[0] if images else data.get('main_image', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800')

    product = Product(
        title=title,
        slug=slug,
        brand_id=data.get('brand_id'),
        category_id=data.get('category_id'),
        description=data.get('description', ''),
        price=price,
        original_price=original_price,
        discount_percent=discount_percent,
        stock=int(data.get('stock', 50)),
        rating=float(data.get('rating', 4.8)),
        review_count=int(data.get('review_count', 0)),
        is_featured=bool(data.get('is_featured', False)),
        is_trending=bool(data.get('is_trending', False)),
        is_new=bool(data.get('is_new', True)),
        is_flash_deal=bool(data.get('is_flash_deal', False)),
        main_image=main_image,
        images_json=json.dumps(images if images else [main_image]),
        colors_json=json.dumps(data.get('colors', ['#0F172A', '#38BDF8', '#818CF8'])),
        sizes_json=json.dumps(data.get('sizes', ['Standard'])),
        specs_json=json.dumps(data.get('specs', {})),
        three_d_model=data.get('three_d_model', 'cyber_watch')
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Product created successfully',
        'product': product.to_dict(full=True)
    }), 201

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    data = request.get_json() or {}
    if 'title' in data: product.title = data['title']
    if 'description' in data: product.description = data['description']
    if 'price' in data: product.price = float(data['price'])
    if 'original_price' in data: product.original_price = float(data['original_price'])
    if 'discount_percent' in data: product.discount_percent = int(data['discount_percent'])
    if 'stock' in data: product.stock = int(data['stock'])
    if 'category_id' in data: product.category_id = data['category_id']
    if 'brand_id' in data: product.brand_id = data['brand_id']
    if 'is_featured' in data: product.is_featured = bool(data['is_featured'])
    if 'is_trending' in data: product.is_trending = bool(data['is_trending'])
    if 'is_new' in data: product.is_new = bool(data['is_new'])
    if 'is_flash_deal' in data: product.is_flash_deal = bool(data['is_flash_deal'])
    if 'main_image' in data: product.main_image = data['main_image']
    if 'images' in data: product.images_json = json.dumps(data['images'])
    if 'specs' in data: product.specs_json = json.dumps(data['specs'])
    if 'three_d_model' in data: product.three_d_model = data['three_d_model']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Product updated successfully',
        'product': product.to_dict(full=True)
    }), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Product deleted successfully'}), 200

# Orders Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders():
    status = request.args.get('status')
    query = Order.query
    if status and status != 'ALL':
        query = query.filter_by(status=status)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['PLACED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']:
        return jsonify({'success': False, 'message': 'Invalid order status'}), 400

    order.status = new_status
    order.tracking_timeline_json = json.dumps(build_tracking_timeline(new_status, order.created_at))

    if new_status == 'DELIVERED' and order.payment_method == 'COD':
        order.payment_status = 'COMPLETED'

    db.session.commit()
    return jsonify({
        'success': True,
        'message': f'Order status updated to {new_status}',
        'order': order.to_dict()
    }), 200
