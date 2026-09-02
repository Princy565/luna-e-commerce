import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.products import products_bp
from routes.cart import cart_bp, wishlist_bp
from routes.orders import orders_bp
from routes.reviews import reviews_bp
from routes.admin import admin_bp
from seed_data import seed_database

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    app.config.from_object(Config)

    # Enable CORS for all frontend origins
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Global Health Check & API Status
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'online',
            'app': 'LUNA E-Commerce REST API',
            'version': '1.0.0',
            'database': 'connected'
        }), 200

    # Serve React frontend in production build if present
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        elif os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        else:
            return jsonify({
                'message': 'LUNA API Backend is running. Access frontend on Vite dev server (e.g. http://localhost:5173)'
            })

    # Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    # Auto-initialize and seed DB on first run
    with app.app_context():
        try:
            db.create_all()
            seed_database(app)
        except Exception as err:
            print(f"Database initialization note: {err}")

    return app

# WSGI entry point for production servers, including Render:
# gunicorn app:app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[STARTING] LUNA Backend API server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
