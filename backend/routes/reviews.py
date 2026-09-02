from flask import Blueprint, request, jsonify, g
from models import db, Review, Product
from routes.auth import token_required

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc()).all()
    
    # Calculate star breakdown
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total_stars = 0
    for r in reviews:
        if 1 <= r.rating <= 5:
            breakdown[r.rating] += 1
            total_stars += r.rating

    avg_rating = round(total_stars / len(reviews), 1) if reviews else 5.0

    return jsonify({
        'success': True,
        'reviews': [r.to_dict() for r in reviews],
        'total_reviews': len(reviews),
        'average_rating': avg_rating,
        'breakdown': breakdown
    }), 200

@reviews_bp.route('', methods=['POST'])
@token_required
def add_review():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    rating = data.get('rating')
    title = data.get('title', '').strip()
    comment = data.get('comment', '').strip()

    if not product_id or not rating or not comment:
        return jsonify({'success': False, 'message': 'Product, rating, and comment are required'}), 400

    if not (1 <= int(rating) <= 5):
        return jsonify({'success': False, 'message': 'Rating must be between 1 and 5 stars'}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    # Add review
    review = Review(
        product_id=product_id,
        user_id=g.current_user.id,
        user_name=g.current_user.name,
        rating=int(rating),
        title=title or 'Verified Purchase Review',
        comment=comment,
        verified_purchase=True
    )
    db.session.add(review)
    db.session.flush()

    # Recalculate average rating & review count for product
    all_reviews = Review.query.filter_by(product_id=product_id).all()
    product.review_count = len(all_reviews)
    product.rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 1)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Review submitted successfully!',
        'review': review.to_dict()
    }), 201
