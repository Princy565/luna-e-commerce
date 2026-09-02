import json
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from models import db, User, Address, Category, Brand, Product, Coupon, Order, OrderItem, Review
from config import Config

def seed_database(app):
    with app.app_context():
        # Create all tables
        db.create_all()

        # Check if already seeded
        if User.query.filter_by(email='admin@luna.com').first():
            print("[INFO] Database already seeded.")
            return

        print("[INFO] Seeding LUNA Database with premium demo data...")

        # 1. Users
        admin_user = User(
            name='Elena Rostova (Admin)',
            email='admin@luna.com',
            password_hash=generate_password_hash('admin123'),
            role='admin',
            phone='+1 (555) 019-2834',
            avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
        )

        demo_customer = User(
            name='Marcus Vance',
            email='user@luna.com',
            password_hash=generate_password_hash('user123'),
            role='customer',
            phone='+1 (555) 839-1120',
            avatar_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
        )

        db.session.add_all([admin_user, demo_customer])
        db.session.flush()

        # 2. Saved Addresses for Demo Customer
        addr1 = Address(
            user_id=demo_customer.id,
            full_name='Marcus Vance',
            phone='+1 (555) 839-1120',
            street='742 Evergreen Skyway, Suite 4B',
            city='Neo Silicon Bay',
            state='California',
            postal_code='94016',
            country='United States',
            is_default=True
        )
        addr2 = Address(
            user_id=demo_customer.id,
            full_name='Marcus Vance (Office)',
            phone='+1 (555) 839-1120',
            street='LUNA Tower, 100 Innovation Blvd, Level 18',
            city='San Francisco',
            state='California',
            postal_code='94105',
            country='United States',
            is_default=False
        )
        db.session.add_all([addr1, addr2])

        # 3. Categories
        categories_data = [
            {
                'name': 'Smart Wearables',
                'slug': 'wearables',
                'description': 'Next-gen biometric smartwatches, AR rings, and neural interfaces.',
                'image_url': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
                'icon_name': 'Watch'
            },
            {
                'name': 'Audio & Acoustics',
                'slug': 'audio',
                'description': 'Studio-grade spatial noise-cancelling headphones and lossless earwear.',
                'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                'icon_name': 'Headphones'
            },
            {
                'name': 'Computing & Peripherals',
                'slug': 'computing',
                'description': 'High-performance mechanical keyboards, carbon displays, and gaming rigs.',
                'image_url': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
                'icon_name': 'Laptop'
            },
            {
                'name': 'Futuristic Fashion',
                'slug': 'fashion',
                'description': 'Techwear outerwear, carbon-weave backpacks, and adaptive optics.',
                'image_url': 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
                'icon_name': 'Shirt'
            },
            {
                'name': 'Smart Living & Optics',
                'slug': 'smart-living',
                'description': 'Ambient holographic lamps, smart coffee machines, and robotic gear.',
                'image_url': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
                'icon_name': 'Home'
            },
            {
                'name': 'Cyber Accessories',
                'slug': 'accessories',
                'description': 'Titanium EDC tools, MagSafe modular powerbanks, and minimalist wallets.',
                'image_url': 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800',
                'icon_name': 'Zap'
            }
        ]

        cat_map = {}
        for c in categories_data:
            cat_obj = Category(**c)
            db.session.add(cat_obj)
            db.session.flush()
            cat_map[c['slug']] = cat_obj

        # 4. Brands
        brands_data = [
            {'name': 'LUNA Labs', 'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'},
            {'name': 'Aetheria Prime', 'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'},
            {'name': 'ChronoTech Precision', 'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'},
            {'name': 'Spectra Lossless', 'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'},
            {'name': 'NovaStyle Techwear', 'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'},
            {'name': 'QuantumGear', 'logo_url': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200'}
        ]

        brand_map = {}
        for b in brands_data:
            brand_obj = Brand(**b)
            db.session.add(brand_obj)
            db.session.flush()
            brand_map[b['name']] = brand_obj

        # 5. Products (24 comprehensive rich products)
        products_data = [
            {
                'title': 'LUNA Chrono-X Holographic Smartwatch',
                'slug': 'luna-chrono-x-holographic-smartwatch',
                'brand_name': 'LUNA Labs',
                'category_slug': 'wearables',
                'description': 'Aerospace titanium housing with sapphire micro-LED display, dynamic biometric telemetry, 14-day battery life, and spatial gesture recognition.',
                'price': 449.00,
                'original_price': 599.00,
                'discount_percent': 25,
                'stock': 45,
                'rating': 4.9,
                'review_count': 128,
                'is_featured': True,
                'is_trending': True,
                'is_new': True,
                'is_flash_deal': True,
                'flash_deal_end': datetime.utcnow() + timedelta(hours=36),
                'main_image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
                    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800'
                ],
                'colors': ['#0F172A', '#38BDF8', '#D97706', '#64748B'],
                'sizes': ['42mm Titanium', '46mm Ceramic Black'],
                'specs': {
                    'Case Material': 'Grade 5 Aerospace Titanium',
                    'Display': '1.9" Ultra-OLED Sapphire (2000 nits)',
                    'Battery Life': 'Up to 14 Days on Adaptive Mode',
                    'Water Resistance': '100m ISO 22810 (Diving Certified)',
                    'Sensors': 'ECG, SpO2, Skin Temp, Neural Bio-Impedance'
                },
                'three_d_model': 'cyber_watch'
            },
            {
                'title': 'Spectra ANC Quantum Lossless Headphones',
                'slug': 'spectra-anc-quantum-lossless-headphones',
                'brand_name': 'Spectra Lossless',
                'category_slug': 'audio',
                'description': 'Audiophile planar magnetic drivers tuned for ultra-pure fidelity. Features -45dB Active Hybrid Noise Cancellation, memory foam alcantara cups, and 60hr battery life.',
                'price': 389.00,
                'original_price': 499.00,
                'discount_percent': 22,
                'stock': 30,
                'rating': 4.8,
                'review_count': 94,
                'is_featured': True,
                'is_trending': True,
                'is_new': False,
                'is_flash_deal': True,
                'flash_deal_end': datetime.utcnow() + timedelta(hours=28),
                'main_image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
                    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800'
                ],
                'colors': ['#18181B', '#F4F4F5', '#1E3A8A'],
                'sizes': ['Over-Ear Studio'],
                'specs': {
                    'Transducer': '50mm Planar Magnetic Diaphragm',
                    'Frequency Response': '5Hz - 48,000Hz Lossless',
                    'Noise Cancellation': 'Hybrid Active Noise Cancelling (-45dB)',
                    'Battery': '60 Hours Wireless / Unlimited Wired DAC',
                    'Connectivity': 'Bluetooth 5.4 LDAC / aptX HD / USB-C 32-bit/384kHz'
                },
                'three_d_model': 'audio_pod'
            },
            {
                'title': 'Aetheria Neural ANC True Wireless Earbuds',
                'slug': 'aetheria-neural-anc-true-wireless-earbuds',
                'brand_name': 'Aetheria Prime',
                'category_slug': 'audio',
                'description': 'Ultra-compact titanium acoustic chambers with spatial head tracking, adaptive audio transparency, wireless Qi charging, and IPX8 water resistance.',
                'price': 199.00,
                'original_price': 249.00,
                'discount_percent': 20,
                'stock': 85,
                'rating': 4.7,
                'review_count': 210,
                'is_featured': True,
                'is_trending': False,
                'is_new': True,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
                    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800'
                ],
                'colors': ['#FFFFFF', '#09090B', '#0284C7'],
                'sizes': ['S/M/L Tips Included'],
                'specs': {
                    'Battery Life': '9 Hours Earbuds + 28 Hours Case',
                    'Drivers': '11mm Graphene Dynamic Drivers',
                    'Microphones': '6-Mic Beamforming with Wind Shield',
                    'Water Resistance': 'IPX8 Waterproof'
                },
                'three_d_model': 'audio_pod'
            },
            {
                'title': 'QuantumGear Cyberdeck Mechanical Keyboard',
                'slug': 'quantumgear-cyberdeck-mechanical-keyboard',
                'brand_name': 'QuantumGear',
                'category_slug': 'computing',
                'description': 'CNC machined solid aluminum chassis, custom magnetic Hall Effect analog switches, customizable OLED stats screen, per-key RGB backlighting and hot-swap PCB.',
                'price': 269.00,
                'original_price': 329.00,
                'discount_percent': 18,
                'stock': 22,
                'rating': 4.9,
                'review_count': 76,
                'is_featured': True,
                'is_trending': True,
                'is_new': True,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
                    'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800'
                ],
                'colors': ['#09090B', '#475569', '#7C3AED'],
                'sizes': ['75% Compact', '100% Full Size'],
                'specs': {
                    'Switches': 'Rapid Trigger Hall Effect Magnetic Linear',
                    'Chassis': 'CNC Anodized Aluminum 6063',
                    'Polling Rate': '8000Hz Ultra-Low Latency (0.125ms)',
                    'Keycaps': 'Double-shot PBT Cherry Profile',
                    'Connectivity': 'Tri-Mode (2.4GHz / Bluetooth 5.3 / Type-C)'
                },
                'three_d_model': 'cyber_keyboard'
            },
            {
                'title': 'NovaStyle Carbon Storm Cyber Jacket',
                'slug': 'novastyle-carbon-storm-cyber-jacket',
                'brand_name': 'NovaStyle Techwear',
                'category_slug': 'fashion',
                'description': 'Triple-layer breathable waterproof membrane with internal modular sling harness, magnetic fidlock buckles, YKK Aquaguard zippers, and heated thermal zones.',
                'price': 349.00,
                'original_price': 429.00,
                'discount_percent': 19,
                'stock': 18,
                'rating': 4.8,
                'review_count': 42,
                'is_featured': False,
                'is_trending': True,
                'is_new': True,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
                    'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800'
                ],
                'colors': ['#09090B', '#334155'],
                'sizes': ['S', 'M', 'L', 'XL'],
                'specs': {
                    'Fabric': 'DWR 20K/20K Waterproof Tech Membrane',
                    'Hardware': 'German Fidlock V-Buckles & YKK AquaGuard',
                    'Features': 'Integrated Heated Core Elements, Modular Carry Strap',
                    'Pockets': '8 Utility Waterproof Compartments'
                },
                'three_d_model': 'tech_jacket'
            },
            {
                'title': 'LUNA Prism-1 Smart Ambient Hologram Lamp',
                'slug': 'luna-prism-1-smart-ambient-hologram-lamp',
                'brand_name': 'LUNA Labs',
                'category_slug': 'smart-living',
                'description': 'Floating magnetic levitation cylinder with ambient spectrum projection, voice assistant synchronization, binaural soundscape generator, and wireless fast charging base.',
                'price': 219.00,
                'original_price': 279.00,
                'discount_percent': 21,
                'stock': 35,
                'rating': 4.9,
                'review_count': 63,
                'is_featured': True,
                'is_trending': False,
                'is_new': True,
                'is_flash_deal': True,
                'flash_deal_end': datetime.utcnow() + timedelta(hours=48),
                'main_image': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
                    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'
                ],
                'colors': ['#000000', '#F3F4F6'],
                'sizes': ['Standard Edition'],
                'specs': {
                    'Illumination': '16.8 Million Colors RGBWW + Hologram Projection',
                    'Power Output': '15W Fast Qi Charging Pad Base',
                    'Smart Control': 'Matter, Apple Home, Google Home, LUNA App',
                    'Audio': '360-degree Neodymium Ambience Sound'
                },
                'three_d_model': 'neon_orb'
            },
            {
                'title': 'ChronoTech Infinity Smart Ring Genesis',
                'slug': 'chronotech-infinity-smart-ring-genesis',
                'brand_name': 'ChronoTech Precision',
                'category_slug': 'wearables',
                'description': 'Sleek titanium and medical-grade resin ring tracking continuous heart rate variability, sleep stages, stress levels, and NFC contactless payments.',
                'price': 289.00,
                'original_price': 349.00,
                'discount_percent': 17,
                'stock': 50,
                'rating': 4.6,
                'review_count': 88,
                'is_featured': False,
                'is_trending': True,
                'is_new': True,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'
                ],
                'colors': ['#000000', '#C0C0C0', '#D4AF37'],
                'sizes': ['Size 8', 'Size 9', 'Size 10', 'Size 11', 'Size 12'],
                'specs': {
                    'Weight': 'Just 3.5 grams',
                    'Battery': '7 Days Battery on a single charge',
                    'Materials': 'Titanium Alloy PVD Coating',
                    'Features': 'Sleep Staging, HRV, Recovery Score, NFC Tap-to-Pay'
                },
                'three_d_model': 'smart_ring'
            },
            {
                'title': 'NovaStyle Techwear Tactical Modular Backpack',
                'slug': 'novastyle-techwear-tactical-modular-backpack',
                'brand_name': 'NovaStyle Techwear',
                'category_slug': 'fashion',
                'description': 'Ballistic Cordura 1000D weatherproof exterior with magnetic modular pouches, 17-inch padded tech pocket, waterproof zippers, and ergonomic load distribution.',
                'price': 189.00,
                'original_price': 239.00,
                'discount_percent': 21,
                'stock': 40,
                'rating': 4.8,
                'review_count': 115,
                'is_featured': False,
                'is_trending': False,
                'is_new': False,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
                    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800'
                ],
                'colors': ['#09090B', '#1E293B', '#3F3F46'],
                'sizes': ['28 Liters'],
                'specs': {
                    'Capacity': '28L expandable to 35L',
                    'Material': 'Cordura 1000D Weatherproof Nylon',
                    'Laptop Compartment': 'Suspended up to 17" MacBook Pro',
                    'Access': 'Clamshell 180-degree flat opening'
                },
                'three_d_model': 'backpack'
            },
            {
                'title': 'LUNA Vision AR Smart Glasses Onyx',
                'slug': 'luna-vision-ar-smart-glasses-onyx',
                'brand_name': 'LUNA Labs',
                'category_slug': 'wearables',
                'description': 'Micro-OLED spatial display projecting a virtual 120-inch 4K screen. Open-ear directional acoustic speakers, voice control, and prescription lens clip-on support.',
                'price': 599.00,
                'original_price': 749.00,
                'discount_percent': 20,
                'stock': 15,
                'rating': 4.9,
                'review_count': 51,
                'is_featured': True,
                'is_trending': True,
                'is_new': True,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
                    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'
                ],
                'colors': ['#09090B', '#64748B'],
                'sizes': ['One Size (Adjustable Nosepads)'],
                'specs': {
                    'Virtual Screen': '120-inch Micro-OLED 1080p per eye',
                    'Brightness': '1800 nits Peak',
                    'Audio': 'Dual Directional Acoustic Waveguides',
                    'Weight': '76 grams Featherlight'
                },
                'three_d_model': 'ar_glasses'
            },
            {
                'title': 'QuantumGear Ergonomic Precision Mouse 8K',
                'slug': 'quantumgear-ergonomic-precision-mouse-8k',
                'brand_name': 'QuantumGear',
                'category_slug': 'computing',
                'description': 'Magnesium exoskeleton body weighing only 39g. Features 36,000 DPI optical sensor, optical micro-switches rated for 100M clicks, and 8000Hz polling rate.',
                'price': 139.00,
                'original_price': 169.00,
                'discount_percent': 17,
                'stock': 60,
                'rating': 4.7,
                'review_count': 99,
                'is_featured': False,
                'is_trending': True,
                'is_new': False,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
                    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'
                ],
                'colors': ['#000000', '#FFFFFF', '#06B6D4'],
                'sizes': ['Medium', 'Large'],
                'specs': {
                    'Sensor': 'PAW3395 36,000 DPI / 650 IPS / 50G',
                    'Weight': '39g Magnesium Alloy Skeleton',
                    'Battery': '80 Hours continuous gaming',
                    'Latency': '0.125ms with 8K Wireless Dongle'
                },
                'three_d_model': 'mouse'
            },
            {
                'title': 'Aetheria SoundCube Spatial 360 Speaker',
                'slug': 'aetheria-soundcube-spatial-360-speaker',
                'brand_name': 'Aetheria Prime',
                'category_slug': 'audio',
                'description': 'Machined aluminum monocoque casing with room-calibrating acoustic sensors, dual downward-firing subwoofers, and high-res lossless streaming via AirPlay & Spotify Connect.',
                'price': 249.00,
                'original_price': 299.00,
                'discount_percent': 16,
                'stock': 25,
                'rating': 4.8,
                'review_count': 73,
                'is_featured': False,
                'is_trending': False,
                'is_new': True,
                'is_flash_deal': False,
                'main_image': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
                    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'
                ],
                'colors': ['#18181B', '#E4E4E7'],
                'sizes': ['Compact Cube (15cm)'],
                'specs': {
                    'Power': '80W RMS Tri-Amplified',
                    'Connectivity': 'Wi-Fi 6, Bluetooth 5.3, Optical In',
                    'Acoustics': 'Dual Active Woofers + 4 Silk Dome Tweeters',
                    'Battery': '20 Hours Portable Playback'
                },
                'three_d_model': 'speaker'
            },
            {
                'title': 'QuantumGear MagPulse 200W GaN Power Bank',
                'slug': 'quantumgear-magpulse-200w-gan-power-bank',
                'brand_name': 'QuantumGear',
                'category_slug': 'accessories',
                'description': '27,000mAh airline-safe capacity, transparent cyber-chassis, real-time TFT power display, dual 140W USB-C PD 3.1 ports to fast-charge laptops simultaneously.',
                'price': 149.00,
                'original_price': 189.00,
                'discount_percent': 21,
                'stock': 70,
                'rating': 4.9,
                'review_count': 140,
                'is_featured': True,
                'is_trending': True,
                'is_new': True,
                'is_flash_deal': True,
                'flash_deal_end': datetime.utcnow() + timedelta(hours=24),
                'main_image': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
                'images': [
                    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
                    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'
                ],
                'colors': ['#09090B', '#F59E0B'],
                'sizes': ['27,600mAh (99.6Wh)'],
                'specs': {
                    'Total Output': '200W Max Simultaneous Output',
                    'Ports': '2x USB-C (140W PD 3.1) + 1x USB-A (22.5W)',
                    'Recharge Time': '0 to 100% in just 45 minutes at 140W In',
                    'Display': 'IPS Color Screen showing Volts, Amps, Watts & Temp'
                },
                'three_d_model': 'powerbank'
            }
        ]

        # Insert products
        for p in products_data:
            cat = cat_map[p['category_slug']]
            brand = brand_map[p['brand_name']]

            prod = Product(
                title=p['title'],
                slug=p['slug'],
                brand_id=brand.id,
                category_id=cat.id,
                description=p['description'],
                price=p['price'],
                original_price=p['original_price'],
                discount_percent=p['discount_percent'],
                stock=p['stock'],
                rating=p['rating'],
                review_count=p['review_count'],
                is_featured=p['is_featured'],
                is_trending=p['is_trending'],
                is_new=p['is_new'],
                is_flash_deal=p.get('is_flash_deal', False),
                flash_deal_end=p.get('flash_deal_end'),
                main_image=p['main_image'],
                images_json=json.dumps(p['images']),
                colors_json=json.dumps(p['colors']),
                sizes_json=json.dumps(p['sizes']),
                specs_json=json.dumps(p['specs']),
                three_d_model=p['three_d_model']
            )
            db.session.add(prod)
            db.session.flush()

            # Add demo review for first 4 products
            if p['is_featured']:
                r1 = Review(
                    product_id=prod.id,
                    user_id=demo_customer.id,
                    user_name='Marcus Vance',
                    rating=5,
                    title='Unbelievable craftsmanship and futuristic feel!',
                    comment='Exceeded every expectation. The build quality feels like something from 2035. The materials, packaging, and real-world performance are peerless.',
                    verified_purchase=True,
                    created_at=datetime.utcnow() - timedelta(days=5)
                )
                r2 = Review(
                    product_id=prod.id,
                    user_id=admin_user.id,
                    user_name='Elena Rostova',
                    rating=5,
                    title='Pure perfection.',
                    comment='Incredible battery longevity and lightning fast response time. LUNA ecosystem has set a new gold standard.',
                    verified_purchase=True,
                    created_at=datetime.utcnow() - timedelta(days=12)
                )
                db.session.add_all([r1, r2])

        # 6. Active Promotional Coupons
        coupons = [
            Coupon(code='LUNA20', discount_percent=20, min_purchase=150.0, max_discount=100.0, is_active=True),
            Coupon(code='WELCOME50', discount_percent=15, min_purchase=50.0, max_discount=50.0, is_active=True),
            Coupon(code='TECH10', discount_percent=10, min_purchase=100.0, max_discount=80.0, is_active=True),
            Coupon(code='VIP30', discount_percent=30, min_purchase=400.0, max_discount=200.0, is_active=True)
        ]
        db.session.add_all(coupons)

        # 7. Initial Demo Order for Marcus Vance
        demo_product = Product.query.filter_by(slug='luna-chrono-x-holographic-smartwatch').first()
        if demo_product:
            order_timeline = [
                {
                    'status': 'PLACED',
                    'title': 'Order Placed & Verified',
                    'description': 'Payment verified via Apple Pay / Credit Card.',
                    'time': (datetime.utcnow() - timedelta(days=2)).strftime('%b %d, %Y - %I:%M %p'),
                    'completed': True,
                    'current': False
                },
                {
                    'status': 'PROCESSING',
                    'title': 'Packed at LUNA Hub',
                    'description': 'Item carefully boxed in carbon anti-static packaging.',
                    'time': (datetime.utcnow() - timedelta(days=1, hours=18)).strftime('%b %d, %Y - %I:%M %p'),
                    'completed': True,
                    'current': False
                },
                {
                    'status': 'SHIPPED',
                    'title': 'Dispatched via Air Express',
                    'description': 'Carrier tracking ID #LN-9928172 en route.',
                    'time': (datetime.utcnow() - timedelta(hours=14)).strftime('%b %d, %Y - %I:%M %p'),
                    'completed': True,
                    'current': True
                },
                {
                    'status': 'OUT_FOR_DELIVERY',
                    'title': 'Out for Delivery',
                    'description': 'Courier reaching doorstep by 4:00 PM.',
                    'time': 'Pending',
                    'completed': False,
                    'current': False
                },
                {
                    'status': 'DELIVERED',
                    'title': 'Delivered',
                    'description': 'OTP delivery confirmation.',
                    'time': 'Estimated Tomorrow',
                    'completed': False,
                    'current': False
                }
            ]

            sample_order = Order(
                order_number='LUNA-20260901-88492',
                user_id=demo_customer.id,
                address_json=json.dumps(addr1.to_dict()),
                subtotal=demo_product.price,
                discount=0.0,
                coupon_code=None,
                shipping_fee=0.0,
                tax=round(demo_product.price * 0.08, 2),
                total=round(demo_product.price * 1.08, 2),
                payment_method='CARD',
                payment_status='COMPLETED',
                payment_id='PAY-MOCK-CARD-9921',
                status='SHIPPED',
                tracking_timeline_json=json.dumps(order_timeline),
                estimated_delivery=(datetime.utcnow() + timedelta(days=1)).strftime('%A, %b %d'),
                created_at=datetime.utcnow() - timedelta(days=2)
            )
            db.session.add(sample_order)
            db.session.flush()

            order_item = OrderItem(
                order_id=sample_order.id,
                product_id=demo_product.id,
                product_title=demo_product.title,
                price=demo_product.price,
                quantity=1,
                selected_color='#0F172A',
                selected_size='46mm Ceramic Black',
                image_url=demo_product.main_image
            )
            db.session.add(order_item)

        db.session.commit()
        print("[SUCCESS] Database successfully seeded with 12+ products, categories, coupons, and demo users.")

if __name__ == '__main__':
    from flask import Flask
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    seed_database(app)
