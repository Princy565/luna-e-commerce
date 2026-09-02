import unittest
import json
from app import create_app
from models import db, User, Product, Category, Brand, Order, Coupon

class LunaEcommerceTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'online')

    def test_02_products_listing_and_filters(self):
        res = self.client.get('/api/products')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertGreater(len(data['products']), 0)

        # Test filter by category
        res_cat = self.client.get('/api/products?category=wearables')
        self.assertEqual(res_cat.status_code, 200)

        # Test search
        res_search = self.client.get('/api/products?q=smartwatch')
        self.assertEqual(res_search.status_code, 200)

        # Test suggestions
        res_sugg = self.client.get('/api/products/search/suggestions?q=cyber')
        self.assertEqual(res_sugg.status_code, 200)

    def test_03_auth_flow(self):
        # Demo Customer Login
        res = self.client.post('/api/auth/login', json={
            'email': 'user@luna.com',
            'password': 'user123'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        token = data['token']
        self.assertTrue(bool(token))

        # Me endpoint
        res_me = self.client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res_me.status_code, 200)

        # Addresses
        res_addr = self.client.get('/api/auth/addresses', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(res_addr.status_code, 200)

    def test_04_cart_and_coupon_flow(self):
        # Login
        res_login = self.client.post('/api/auth/login', json={'email': 'user@luna.com', 'password': 'user123'})
        token = json.loads(res_login.data)['token']
        headers = {'Authorization': f'Bearer {token}'}

        # Add to cart
        product = Product.query.first()
        res_add = self.client.post('/api/cart', headers=headers, json={
            'product_id': product.id,
            'quantity': 2
        })
        self.assertEqual(res_add.status_code, 200)

        # Get cart with coupon
        res_cart = self.client.get('/api/cart?coupon=LUNA20', headers=headers)
        self.assertEqual(res_cart.status_code, 200)
        cart_data = json.loads(res_cart.data)['cart']
        self.assertGreater(cart_data['items_count'], 0)

        # Validate Coupon
        res_coup = self.client.post('/api/cart/coupon/validate', headers=headers, json={'code': 'LUNA20'})
        self.assertEqual(res_coup.status_code, 200)

    def test_05_admin_portal_flow(self):
        # Login as Admin
        res_login = self.client.post('/api/auth/login', json={'email': 'admin@luna.com', 'password': 'admin123'})
        token = json.loads(res_login.data)['token']
        headers = {'Authorization': f'Bearer {token}'}

        # Stats
        res_stats = self.client.get('/api/admin/statistics', headers=headers)
        self.assertEqual(res_stats.status_code, 200)
        stats = json.loads(res_stats.data)['stats']
        self.assertIn('total_revenue', stats)
        self.assertIn('total_products', stats)

        # Orders list
        res_orders = self.client.get('/api/admin/orders', headers=headers)
        self.assertEqual(res_orders.status_code, 200)

if __name__ == '__main__':
    unittest.main()
