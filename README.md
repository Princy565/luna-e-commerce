# LUNA — Premium Full-Stack 3D E-Commerce Platform

![LUNA Banner](https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200)

**LUNA** is a next-generation full-stack 3D e-commerce platform engineered with a modern Python Flask REST API backend, MySQL / SQLAlchemy relational database, and an ultra-responsive React SPA frontend with Three.js interactive 3D visualizations, multi-attribute catalog filtering, dynamic shopping cart, multi-step checkout with realistic simulated payments, courier tracking timelines, customer reviews, and an executive administration portal.

---

## 🚀 Key Highlights & Features

- **3D Spatial Product Experience**: Interactive Three.js canvas featuring floating titanium smartwatches, acoustic spheres, and cyber-gadgets with mouse parallax orbit controls, lighting shaders, and graceful 2D fallbacks.
- **Dynamic Catalog Engine**: Multi-dimensional filtering by category, brand, price slider, minimum star rating, discount brackets, stock availability, and sorting (featured, price, newest, ratings).
- **Intelligent Search & Autocomplete**: Debounced live search with keyword matching across titles, brands, and categories, plus simulated voice search.
- **Interactive Shopping Bag**: Real-time tax & shipping calculations, dynamic free-shipping progress meter, promo coupon validation (`LUNA20`, `WELCOME50`, `VIP30`), and 1-click move to wishlist.
- **Multi-Step Checkout & Simulated Payment**: 4-stage wizard (Address Selection/Creation ➔ Delivery Speed ➔ Payment Simulation: Credit Card, UPI QR Code, Cash on Delivery ➔ Order Placement).
- **Order Lifecycle & Milestone Tracking**: Generates unique reference IDs, live status tracking timeline (`PLACED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`), and order cancellation with automatic inventory restock.
- **Verified Customer Reviews**: Star rating breakdown calculations, customer review submission, and average score recalculations.
- **Executive Admin Portal**: Net revenue KPI cards, 7-day sales charts, category volume bars, inventory CRUD (Add, Edit, Delete, Stock update), and order status lifecycle switcher.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Three.js, Lucide Icons, Canvas Confetti |
| **Backend** | Python 3.12+, Flask 3.0, Flask-SQLAlchemy, PyMySQL, PyJWT, Werkzeug, Flask-CORS |
| **Database** | MySQL 8.0+ (with SQLite zero-config fallback for instant local evaluation) |
| **Styling** | Custom Obsidian Modern Design System with Glassmorphism, CSS3 Grids & Animations |

---

## 📁 Project Architecture

```
LUNA E-commerce/
├── backend/
│   ├── routes/
│   │   ├── admin.py        # Admin analytics KPI & inventory CRUD
│   │   ├── auth.py         # Authentication, JWT, profile & addresses
│   │   ├── cart.py         # Dynamic cart, wishlist & coupon logic
│   │   ├── orders.py       # Multi-step checkout & tracking milestones
│   │   ├── products.py     # Product filters, search & suggestions
│   │   └── reviews.py      # Customer reviews & ratings distribution
│   ├── app.py              # Flask server entrypoint & CORS setup
│   ├── config.py           # Database & JWT configurations
│   ├── models.py           # SQLAlchemy normalized schema models
│   ├── schema.sql          # Production MySQL DDL schema
│   ├── seed_data.py        # Demo seeder with 12+ rich realistic products
│   ├── test_api.py         # Automated API test suite
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── api/            # API client layer with JWT interceptors
│   │   ├── components/     # ThreeHeroViewer, Navbar, Footer, ProductCard, FilterDrawer, etc.
│   │   ├── context/        # Auth, Cart, Wishlist, Toast state providers
│   │   ├── pages/          # Home, Products, ProductDetails, Cart, Checkout, Admin, etc.
│   │   ├── App.jsx         # App router & layout container
│   │   ├── index.css       # Full custom Obsidian theme design system
│   │   └── main.jsx        # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start Guide (Local Setup)

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.10+) and **pip**
- *(Optional)* **MySQL Server** (v8.0+) if running MySQL directly

---

### 1. Backend Setup & Startup

1. Open a terminal in the project directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. *(Optional)* Configure MySQL in `backend/.env`:
   ```env
   USE_SQLITE=false
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_DB=luna_ecommerce
   ```
   > **Note**: If `USE_SQLITE=true` is kept (the default), the app automatically uses a local zero-config database without requiring a running MySQL server.

4. Seed the database with rich demo products:
   ```bash
   python seed_data.py
   ```

5. Run the Flask backend server:
   ```bash
   python app.py
   ```
   *The backend REST API will be running on `http://127.0.0.1:5000`.*

---

### 2. Frontend Setup & Startup

1. Open a second terminal:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser at `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

The database is pre-seeded with instant evaluation accounts. You can also click the quick-fill buttons in the Sign In modal:

| Role | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@luna.com` | `admin123` | Full Admin Center, Inventory CRUD, Order Management |
| **Demo Customer** | `user@luna.com` | `user123` | Cart, Wishlist, Checkout, Saved Addresses, Orders |

---

## 🎟 Promotional Test Coupons

Test these coupons in your shopping bag or checkout:

- **`LUNA20`** — **20% OFF** (Minimum purchase: $150)
- **`WELCOME50`** — **15% OFF** (Minimum purchase: $50)
- **`VIP30`** — **30% OFF** (Minimum purchase: $400)

---

## 📡 REST API Reference

| Endpoint | Method | Description | Auth Required |
| :--- | :---: | :--- | :---: |
| `/api/health` | `GET` | Backend health & status | Public |
| `/api/auth/register` | `POST` | Register a new user | Public |
| `/api/auth/login` | `POST` | Authenticate user & receive JWT | Public |
| `/api/auth/me` | `GET` | Get current user profile | User Token |
| `/api/auth/profile` | `PUT` | Update user personal details | User Token |
| `/api/auth/addresses` | `GET` / `POST` | Get or add saved addresses | User Token |
| `/api/products` | `GET` | List & filter products (category, brand, price, rating, sort) | Public |
| `/api/products/:id` | `GET` | Get single product, specs & related items | Public |
| `/api/products/search/suggestions` | `GET` | Autocomplete search suggestions | Public |
| `/api/cart` | `GET` / `POST` | View cart totals or add item | User Token |
| `/api/cart/:id` | `PUT` / `DELETE` | Update quantity or remove cart item | User Token |
| `/api/cart/coupon/validate` | `POST` | Validate & apply coupon voucher | User Token |
| `/api/wishlist` | `GET` / `POST` | View wishlist or add item | User Token |
| `/api/wishlist/move-to-cart/:id` | `POST` | Move item from wishlist to cart | User Token |
| `/api/orders` | `GET` | Get user order history | User Token |
| `/api/orders/checkout` | `POST` | Multi-step order placement & mock payment | User Token |
| `/api/orders/:id/cancel` | `POST` | Cancel order and restore stock | User Token |
| `/api/reviews/product/:id` | `GET` | Get product reviews & star breakdown | Public |
| `/api/reviews` | `POST` | Submit verified customer review | User Token |
| `/api/admin/statistics` | `GET` | Executive revenue KPIs & charts | Admin Token |
| `/api/admin/products` | `POST` | Create new hardware product | Admin Token |
| `/api/admin/products/:id` | `PUT` / `DELETE` | Update product or remove from catalog | Admin Token |
| `/api/admin/orders/:id/status` | `PUT` | Update order fulfillment status milestone | Admin Token |

---

## 🧪 Running Automated Tests

To execute the Python backend unit & integration tests:
```bash
cd backend
python test_api.py
```
To verify the frontend production build:
```bash
cd frontend
npm run build
```
