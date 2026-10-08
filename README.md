# 👗 Kloset — Full MERN Stack Thrift Store Platform

**Kloset** is a modern MERN stack sustainable thrift store platform where users can **register using their Gmail or phone number**, browse and buy pre-loved clothes, or list their own second-hand clothes for sale.

---

## 🛠️ The MERN Stack Architecture

| Layer | Technology | Responsibilities |
|---|---|---|
| **M** — MongoDB | MongoDB Atlas + Mongoose ODM | Collections for users (`User`), second-hand garments (`ClothingItem`), planned outfits (`Outfit`), and orders (`Order`). |
| **E** — Express.js | Express 4.x REST API | Authentication endpoints (`/api/auth`), garment listings & filters (`/api/clothes`), orders (`/api/orders`), and AI studio detector. |
| **R** — React.js | React 19 + Vite + React Router 7 | Thrift Store (Buy & Sell dual-mode page), Auth modal (Gmail / Phone signup), cart bag drawer, profile rack, and wardrobe. |
| **N** — Node.js | Node.js v24 (LTS) | Powers the server backend, `--watch` hot-reloading, bcryptjs password hashing, JWT sessions, and concurrent builds. |

---

## 🌟 Key Features

### 1. 🔐 User Registration with Gmail or Phone Number
- **Name Registration**: Users register their display name.
- **Registration Method Selector**:
  - **✉️ Gmail / Email**: Register with Google Gmail address (`user@gmail.com`).
  - **📱 Phone Number**: Register with mobile phone number (`+91 98765 43210` or 10-digit phone).
- **Password Protection**: Passwords securely hashed with `bcryptjs` and session tokens issued with `jsonwebtoken`.
- **Unique Thrift Handles & Avatars**: Generates unique creator handles (e.g., `@priya_482`) and stylish personalized avatars.
- **Login Support**: Sign in using either your Gmail address or Phone number.

### 2. 🛍️ Second-Hand Clothes Thrift Store (Buy & Sell)
- **Primary Dual-Mode Page** (`/market`, `/thrift`, `/thrift-store`):
  - **🛒 BUY SECOND-HAND CLOTHES**:
    - Browse pre-loved clothes catalog (Tops, Bottoms, Outerwear, Dresses, Shoes, Accessories).
    - Condition tags: *Gently Used*, *Like New*, *Brand New with Tags*, *Vintage Thrifted*, *Customized / Upcycled*.
    - Search by garment title, brand (Levi's, Zara, Champion, etc.), color, or style tags.
    - View savings percentage (calculated between Selling Price and Original Retail Price).
    - Quick View modal displaying seller details, direct phone/call/WhatsApp contact, and Gmail contact.
    - One-click "Add to Bag" and simulated checkout with celebration confetti.
  - **🏷️ SELL SECOND-HAND CLOTHES**:
    - Direct listing form tailored specifically for second-hand clothing.
    - Garment photo upload (gallery, camera, or quick demo samples).
    - Title, category, brand, size, color, condition, and thrift story notes.
    - Pricing controls (selling price and original retail price).
    - Seller contact info (phone/Gmail auto-filled from registration).
    - Instant publishing to MongoDB backend (`POST /api/clothes`).
  - **📦 MY ACTIVE LISTINGS**:
    - View your listed items, mark as Sold or Available, or delete listings.

### 3. 👗 Private Wardrobe & AI Studio Enhancer
- Keep clothes in your private digital closet or click "List for Sale" to publish them.
- AI garment auto-tagger and HTML5 Canvas studio backdrop enhancer.

---

## 🚀 Quick Start (Single Command)

From the root project folder:

```bash
# 1. Install all dependencies (root, backend, and frontend)
npm run install:all

# 2. Run both Backend & Frontend simultaneously
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001](http://localhost:5001)

---

## 📂 Project Structure

```
MERN_Kloset.in/
├── package.json               # Root unified scripts (concurrently backend + frontend)
├── backend/                   # Node.js + Express + MongoDB backend
│   ├── .env                   # MongoDB Atlas URI & configuration
│   ├── server.js              # Express app entry point
│   ├── models/                # Mongoose Models
│   │   ├── User.js            # User model (name, gmail, phone, password, handle, avatar)
│   │   ├── ClothingItem.js    # Clothes (condition, price, sellerPhone, sellerEmail, status)
│   │   ├── Outfit.js          # Planned looks
│   │   └── Order.js           # Checkout transactions & seller earnings
│   └── routes/                # REST API Endpoints
│       ├── authRoutes.js      # Register (Gmail / Phone), Login, User directory
│       ├── clothingRoutes.js  # Thrift items CRUD & filtering (condition, category, price)
│       ├── orderRoutes.js     # Checkout transactions
│       ├── outfitRoutes.js    # Outfit planner lookbooks
│       ├── aiRoutes.js        # AI photo analysis
│       └── seedRoutes.js      # Seed generator
└── frontend/                  # React 19 + Vite frontend
    ├── src/
    │   ├── context/
    │   │   └── AppContext.jsx # Global user authentication, cart, wishlist, notifications
    │   ├── components/
    │   │   ├── Navbar.jsx     # Navigation, Thrift Store badge, user auth pill
    │   │   ├── AuthModal.jsx  # Register with Gmail or Phone & Sign In modal
    │   │   ├── CartDrawer.jsx # Slide-over bag & checkout with confetti
    │   │   └── StudioEnhancer.jsx # Canvas backdrop & AI analysis
    │   ├── pages/
    │   │   ├── ThriftMarket.jsx# Dedicated page to Buy or Sell second-hand clothes
    │   │   ├── ExploreFeed.jsx # Social feed with likes, comments, and buy actions
    │   │   ├── MyCloset.jsx   # Private wardrobe with "List for Sale" toggle
    │   │   ├── OutfitPlanner.jsx # Virtual stylist & outfit mixer
    │   │   ├── AddClothing.jsx# Garment upload with AI auto-tag
    │   │   └── ProfilePage.jsx# Profile, registered contact details, and sales earnings
    │   ├── style.css          # Editorial fashion styling & responsive design
    │   └── App.jsx            # Router and app shell
```