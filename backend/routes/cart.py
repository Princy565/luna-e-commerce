from flask import Blueprint, request, jsonify, g
from models import db, CartItem, WishlistItem, Product, Coupon
from routes.auth import token_required

cart_bp = Blueprint('cart', __name__)
wishlist_bp = Blueprint('wishlist', __name__)

FREE_SHIPPING_THRESHOLD = 999.0
STANDARD_SHIPPING_FEE = 99.0
TAX_RATE = 0.08  # 8% GST/Tax

def compute_cart_totals(user_id, coupon_code=None):
    items = CartItem.query.filter_by(user_id=user_id).all()
    subtotal = sum(item.product.price * item.quantity for item in items if item.product)
    
    discount = 0.0
    valid_coupon = None
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code.upper().strip(), is_active=True).first()
        if coupon and subtotal >= coupon.min_purchase:
            discount = (subtotal * coupon.discount_percent) / 100.0
            if coupon.max_discount and discount > coupon.max_discount:
                discount = coupon.max_discount
            valid_coupon = coupon.to_dict()

    discounted_subtotal = max(0.0, subtotal - discount)
    shipping = 0.0 if (discounted_subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0) else STANDARD_SHIPPING_FEE
    tax = round(discounted_subtotal * TAX_RATE, 2)
    total = round(discounted_subtotal + shipping + tax, 2)

    return {
        'items': [i.to_dict() for i in items if i.product],
        'items_count': sum(i.quantity for i in items),
        'subtotal': round(subtotal, 2),
        'discount': round(discount, 2),
        'coupon': valid_coupon,
        'free_shipping_threshold': FREE_SHIPPING_THRESHOLD,
        'shipping_fee': round(shipping, 2),
        'tax': tax,
        'total': total,
        'qualifies_free_shipping': (discounted_subtotal >= FREE_SHIPPING_THRESHOLD and subtotal > 0)
    }

# Cart Routes
@cart_bp.route('', methods=['GET'])
@token_required
def get_cart():
    coupon_code = request.args.get('coupon')
    data = compute_cart_totals(g.current_user.id, coupon_code)
    return jsonify({'success': True, 'cart': data}), 200

@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    color = data.get('color')
    size = data.get('size')

    if not product_id or quantity <= 0:
        return jsonify({'success': False, 'message': 'Invalid product or quantity'}), 400

    product = Product.query.get(product_id)
    if not product or product.stock <= 0:
        return jsonify({'success': False, 'message': 'Product is out of stock'}), 400

    existing_item = CartItem.query.filter_by(
        user_id=g.current_user.id,
        product_id=product_id,
        selected_color=color,
        selected_size=size
    ).first()

    if existing_item:
        existing_item.quantity += quantity
        if existing_item.quantity > product.stock:
            existing_item.quantity = product.stock
    else:
        new_item = CartItem(
            user_id=g.current_user.id,
            product_id=product_id,
            quantity=min(quantity, product.stock),
            selected_color=color,
            selected_size=size
        )
        db.session.add(new_item)

    db.session.commit()
    cart_summary = compute_cart_totals(g.current_user.id)
    return jsonify({
        'success': True,
        'message': f'"{product.title}" added to cart',
        'cart': cart_summary
    }), 200

@cart_bp.route('/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(item_id):
    data = request.get_json() or {}
    quantity = data.get('quantity', 1)

    item = CartItem.query.filter_by(id=item_id, user_id=g.current_user.id).first()
    if not item:
        return jsonify({'success': False, 'message': 'Cart item not found'}), 404

    if quantity <= 0:
        db.session.delete(item)
    else:
        if item.product and quantity > item.product.stock:
            quantity = item.product.stock
        item.quantity = quantity

    db.session.commit()
    cart_summary = compute_cart_totals(g.current_user.id)
    return jsonify({'success': True, 'cart': cart_summary}), 200

@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@token_required
def delete_cart_item(item_id):
    item = CartItem.query.filter_by(id=item_id, user_id=g.current_user.id).first()
    if not item:
        return jsonify({'success': False, 'message': 'Cart item not found'}), 404

    db.session.delete(item)
    db.session.commit()
    cart_summary = compute_cart_totals(g.current_user.id)
    return jsonify({'success': True, 'message': 'Item removed', 'cart': cart_summary}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_cart():
    CartItem.query.filter_by(user_id=g.current_user.id).delete()
    db.session.commit()
    return jsonify({'success': True, 'message': 'Cart cleared'}), 200

@cart_bp.route('/coupon/validate', methods=['POST'])
@token_required
def validate_coupon():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    if not code:
        return jsonify({'success': False, 'message': 'Coupon code is required'}), 400

    coupon = Coupon.query.filter_by(code=code, is_active=True).first()
    if not coupon:
        return jsonify({'success': False, 'message': 'Invalid or expired coupon code'}), 404

    cart_summary = compute_cart_totals(g.current_user.id, coupon_code=code)
    if cart_summary['subtotal'] < coupon.min_purchase:
        return jsonify({
            'success': False,
            'message': f'Coupon {code} requires a minimum order amount of ${coupon.min_purchase:.2f}'
        }), 400

    return jsonify({
        'success': True,
        'message': f'Coupon {code} applied successfully! {coupon.discount_percent}% off',
        'coupon': coupon.to_dict(),
        'cart': cart_summary
    }), 200

# Wishlist Routes
@wishlist_bp.route('', methods=['GET'])
@token_required
def get_wishlist():
    items = WishlistItem.query.filter_by(user_id=g.current_user.id).order_by(WishlistItem.id.desc()).all()
    return jsonify({
        'success': True,
        'items': [w.to_dict() for w in items if w.product]
    }), 200

@wishlist_bp.route('', methods=['POST'])
@token_required
def add_to_wishlist():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    if not product_id:
        return jsonify({'success': False, 'message': 'Product ID is required'}), 400

    existing = WishlistItem.query.filter_by(user_id=g.current_user.id, product_id=product_id).first()
    if existing:
        return jsonify({'success': True, 'message': 'Product already in wishlist', 'item': existing.to_dict()}), 200

    item = WishlistItem(user_id=g.current_user.id, product_id=product_id)
    db.session.add(item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Added to wishlist', 'item': item.to_dict()}), 201

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
@token_required
def remove_from_wishlist(product_id):
    item = WishlistItem.query.filter_by(user_id=g.current_user.id, product_id=product_id).first()
    if not item:
        # Also check by wishlist row id
        item = WishlistItem.query.filter_by(user_id=g.current_user.id, id=product_id).first()

    if item:
        db.session.delete(item)
        db.session.commit()

    return jsonify({'success': True, 'message': 'Removed from wishlist'}), 200

@wishlist_bp.route('/move-to-cart/<int:product_id>', methods=['POST'])
@token_required
def move_wishlist_to_cart(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    # Add to cart
    existing_cart = CartItem.query.filter_by(user_id=g.current_user.id, product_id=product_id).first()
    if existing_cart:
        existing_cart.quantity += 1
    else:
        new_cart = CartItem(user_id=g.current_user.id, product_id=product_id, quantity=1)
        db.session.add(new_cart)

    # Remove from wishlist
    WishlistItem.query.filter_by(user_id=g.current_user.id, product_id=product_id).delete()

    db.session.commit()
    cart_summary = compute_cart_totals(g.current_user.id)
    return jsonify({
        'success': True,
        'message': f'Moved "{product.title}" to cart',
        'cart': cart_summary
    }), 200
