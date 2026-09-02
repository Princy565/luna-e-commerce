from flask import Blueprint, request, jsonify, g
import json
import uuid
import random
from datetime import datetime, timedelta
from models import db, Order, OrderItem, CartItem, Product, Coupon, Address
from routes.auth import token_required
from routes.cart import compute_cart_totals

orders_bp = Blueprint('orders', __name__)

def generate_order_number():
    return f"LUNA-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(10000, 99999)}"

def build_tracking_timeline(status='PLACED', created_at=None):
    now = created_at or datetime.utcnow()
    timeline = [
        {
            'status': 'PLACED',
            'title': 'Order Placed & Confirmed',
            'description': 'Your order has been verified and sent to fulfillment.',
            'time': now.strftime('%b %d, %Y - %I:%M %p'),
            'completed': True,
            'current': (status == 'PLACED')
        },
        {
            'status': 'PROCESSING',
            'title': 'Packed at LUNA Fulfillment Center',
            'description': 'Items verified, premium boxed and prepared for dispatch.',
            'time': (now + timedelta(hours=6)).strftime('%b %d, %Y - %I:%M %p') if status in ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] else 'Pending',
            'completed': status in ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'],
            'current': (status == 'PROCESSING')
        },
        {
            'status': 'SHIPPED',
            'title': 'Dispatched via Express Courier',
            'description': 'Air courier tracking number assigned and on transit route.',
            'time': (now + timedelta(days=1)).strftime('%b %d, %Y - %I:%M %p') if status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'] else 'Pending',
            'completed': status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'],
            'current': (status == 'SHIPPED')
        },
        {
            'status': 'OUT_FOR_DELIVERY',
            'title': 'Out for Delivery',
            'description': 'Your delivery partner is en route to your shipping address.',
            'time': (now + timedelta(days=2)).strftime('%b %d, %Y - %I:%M %p') if status in ['OUT_FOR_DELIVERY', 'DELIVERED'] else 'Pending',
            'completed': status in ['OUT_FOR_DELIVERY', 'DELIVERED'],
            'current': (status == 'OUT_FOR_DELIVERY')
        },
        {
            'status': 'DELIVERED',
            'title': 'Delivered Successfully',
            'description': 'Package handed over with OTP verification.',
            'time': (now + timedelta(days=2, hours=4)).strftime('%b %d, %Y - %I:%M %p') if status == 'DELIVERED' else 'Estimated',
            'completed': status == 'DELIVERED',
            'current': (status == 'DELIVERED')
        }
    ]
    if status == 'CANCELLED':
        timeline.append({
            'status': 'CANCELLED',
            'title': 'Order Cancelled',
            'description': 'This order has been cancelled and refund initiated (if prepaid).',
            'time': datetime.utcnow().strftime('%b %d, %Y - %I:%M %p'),
            'completed': True,
            'current': True
        })
    return timeline

@orders_bp.route('', methods=['GET'])
@token_required
def get_user_orders():
    orders = Order.query.filter_by(user_id=g.current_user.id).order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@token_required
def get_order_details(order_id):
    order = Order.query.filter_by(id=order_id, user_id=g.current_user.id).first()
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    return jsonify({
        'success': True,
        'order': order.to_dict()
    }), 200

@orders_bp.route('/by-number/<string:order_number>', methods=['GET'])
@token_required
def get_order_by_number(order_number):
    order = Order.query.filter_by(order_number=order_number, user_id=g.current_user.id).first()
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    return jsonify({
        'success': True,
        'order': order.to_dict()
    }), 200

@orders_bp.route('/checkout', methods=['POST'])
@token_required
def checkout_order():
    data = request.get_json() or {}
    address_id = data.get('address_id')
    custom_address = data.get('address')
    payment_method = data.get('payment_method', 'CARD') # 'CARD', 'UPI', 'COD'
    coupon_code = data.get('coupon_code')
    mock_payment_status = data.get('mock_payment_status', 'SUCCESS') # 'SUCCESS', 'FAILED'

    # Retrieve shipping address
    selected_address = None
    if address_id:
        addr = Address.query.filter_by(id=address_id, user_id=g.current_user.id).first()
        if addr:
            selected_address = addr.to_dict()
    elif custom_address and isinstance(custom_address, dict):
        selected_address = custom_address

    if not selected_address:
        return jsonify({'success': False, 'message': 'Valid shipping address is required'}), 400

    # Retrieve cart items
    cart_summary = compute_cart_totals(g.current_user.id, coupon_code)
    cart_items = CartItem.query.filter_by(user_id=g.current_user.id).all()

    if not cart_items:
        return jsonify({'success': False, 'message': 'Cart is empty'}), 400

    # Validate stock
    for item in cart_items:
        if not item.product or item.product.stock < item.quantity:
            return jsonify({
                'success': False,
                'message': f'Product "{item.product.title if item.product else "Item"}" is out of stock'
            }), 400

    # Payment Simulation check
    if mock_payment_status == 'FAILED' and payment_method != 'COD':
        return jsonify({
            'success': False,
            'message': 'Payment simulation declined: Card/UPI payment failed. Please retry.'
        }), 402

    # Create Order
    order_num = generate_order_number()
    delivery_date = (datetime.utcnow() + timedelta(days=2)).strftime('%A, %b %d')

    new_order = Order(
        order_number=order_num,
        user_id=g.current_user.id,
        address_json=json.dumps(selected_address),
        subtotal=cart_summary['subtotal'],
        discount=cart_summary['discount'],
        coupon_code=coupon_code if cart_summary['coupon'] else None,
        shipping_fee=cart_summary['shipping_fee'],
        tax=cart_summary['tax'],
        total=cart_summary['total'],
        payment_method=payment_method,
        payment_status='COMPLETED' if payment_method != 'COD' else 'PENDING',
        payment_id=f"PAY-{uuid.uuid4().hex[:12].upper()}" if payment_method != 'COD' else 'COD-ON-DELIVERY',
        status='PLACED',
        tracking_timeline_json=json.dumps(build_tracking_timeline('PLACED')),
        estimated_delivery=delivery_date
    )

    db.session.add(new_order)
    db.session.flush() # Flush to get new_order.id

    # Create Order Items and adjust stock
    for item in cart_items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product.id,
            product_title=item.product.title,
            price=item.product.price,
            quantity=item.quantity,
            selected_color=item.selected_color,
            selected_size=item.selected_size,
            image_url=item.product.main_image
        )
        db.session.add(order_item)

        # Deduct inventory stock
        item.product.stock = max(0, item.product.stock - item.quantity)

    # Empty user's cart
    CartItem.query.filter_by(user_id=g.current_user.id).delete()

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Order placed successfully!',
        'order': new_order.to_dict()
    }), 201

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@token_required
def cancel_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=g.current_user.id).first()
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if order.status in ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED']:
        return jsonify({
            'success': False,
            'message': f'Order cannot be cancelled in its current state ({order.status})'
        }), 400

    order.status = 'CANCELLED'
    order.tracking_timeline_json = json.dumps(build_tracking_timeline('CANCELLED', order.created_at))

    # Restore inventory
    for item in order.items:
        if item.product_id:
            prod = Product.query.get(item.product_id)
            if prod:
                prod.stock += item.quantity

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Order cancelled successfully',
        'order': order.to_dict()
    }), 200
