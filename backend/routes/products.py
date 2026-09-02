from flask import Blueprint, request, jsonify
from models import db, Product, Category, Brand, Review
from sqlalchemy import or_, desc, asc

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    category_slug = request.args.get('category')
    brand_name = request.args.get('brand')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('min_rating', type=float)
    in_stock = request.args.get('in_stock')
    is_featured = request.args.get('featured')
    is_trending = request.args.get('trending')
    is_new = request.args.get('new')
    is_flash_deal = request.args.get('flash_deal')
    discount_min = request.args.get('discount_min', type=int)
    sort_by = request.args.get('sort', 'featured') # 'featured', 'price_asc', 'price_desc', 'rating', 'newest', 'discount'
    search_query = request.args.get('q', '').strip()

    query = Product.query

    # Category filter
    if category_slug and category_slug != 'all':
        cat = Category.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    # Brand filter
    if brand_name and brand_name != 'all':
        brand = Brand.query.filter_by(name=brand_name).first()
        if brand:
            query = query.filter(Product.brand_id == brand.id)

    # Price filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Rating filter
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)

    # In-stock filter
    if in_stock == 'true':
        query = query.filter(Product.stock > 0)

    # Flags
    if is_featured == 'true':
        query = query.filter(Product.is_featured == True)
    if is_trending == 'true':
        query = query.filter(Product.is_trending == True)
    if is_new == 'true':
        query = query.filter(Product.is_new == True)
    if is_flash_deal == 'true':
        query = query.filter(Product.is_flash_deal == True)
    if discount_min:
        query = query.filter(Product.discount_percent >= discount_min)

    # Search filter
    if search_query:
        search_filter = or_(
            Product.title.ilike(f'%{search_query}%'),
            Product.description.ilike(f'%{search_query}%'),
            Product.slug.ilike(f'%{search_query}%')
        )
        query = query.filter(search_filter)

    # Sorting
    if sort_by == 'price_asc':
        query = query.order_by(asc(Product.price))
    elif sort_by == 'price_desc':
        query = query.order_by(desc(Product.price))
    elif sort_by == 'rating':
        query = query.order_by(desc(Product.rating))
    elif sort_by == 'newest':
        query = query.order_by(desc(Product.created_at))
    elif sort_by == 'discount':
        query = query.order_by(desc(Product.discount_percent))
    else: # default popularity / featured
        query = query.order_by(desc(Product.is_featured), desc(Product.rating))

    total = query.count()
    paginated_products = query.offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        'success': True,
        'total': total,
        'page': page,
        'limit': limit,
        'pages': (total + limit - 1) // limit,
        'products': [p.to_dict() for p in paginated_products]
    }), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    # Fetch related products in the same category
    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id
    ).limit(4).all()

    # Fetch frequently bought together products
    frequently_bought = Product.query.filter(
        Product.id != product.id
    ).order_by(desc(Product.rating)).limit(3).all()

    return jsonify({
        'success': True,
        'product': product.to_dict(full=True),
        'related_products': [p.to_dict() for p in related],
        'frequently_bought_together': [p.to_dict() for p in frequently_bought]
    }), 200

@products_bp.route('/slug/<string:slug>', methods=['GET'])
def get_product_by_slug(slug):
    product = Product.query.filter_by(slug=slug).first()
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id
    ).limit(4).all()

    frequently_bought = Product.query.filter(
        Product.id != product.id
    ).order_by(desc(Product.rating)).limit(3).all()

    return jsonify({
        'success': True,
        'product': product.to_dict(full=True),
        'related_products': [p.to_dict() for p in related],
        'frequently_bought_together': [p.to_dict() for p in frequently_bought]
    }), 200

@products_bp.route('/search/suggestions', methods=['GET'])
def search_suggestions():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        # Return trending / popular searches
        popular_queries = ['Cyberpunk Smartwatch', 'Wireless Earbuds', 'Titanium Mechanical Keyboard', 'Leather Tech Backpack', 'VR Headset']
        return jsonify({'success': True, 'suggestions': [], 'popular': popular_queries}), 200

    products = Product.query.filter(Product.title.ilike(f'%{q}%')).limit(6).all()
    categories = Category.query.filter(Category.name.ilike(f'%{q}%')).limit(3).all()
    brands = Brand.query.filter(Brand.name.ilike(f'%{q}%')).limit(3).all()

    results = []
    for p in products:
        results.append({'type': 'product', 'id': p.id, 'title': p.title, 'image': p.main_image, 'price': p.price})
    for c in categories:
        results.append({'type': 'category', 'name': c.name, 'slug': c.slug})
    for b in brands:
        results.append({'type': 'brand', 'name': b.name})

    return jsonify({
        'success': True,
        'suggestions': results
    }), 200

@products_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify({
        'success': True,
        'categories': [c.to_dict() for c in categories]
    }), 200

@products_bp.route('/brands', methods=['GET'])
def get_brands():
    brands = Brand.query.all()
    return jsonify({
        'success': True,
        'brands': [b.to_dict() for b in brands]
    }), 200
