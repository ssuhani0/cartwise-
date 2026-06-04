# CartWise - AI-Powered Kirana Shopping Web App

A production-ready, AI-powered grocery shopping web application for Indian users. Built with **React + Vite** (frontend) and **FastAPI** (backend), integrating OCR for handwritten grocery lists, AI recommendations, and Razorpay payments.

## Architecture

```
CartWise/
├── frontend/          # React + Vite + Tailwind CSS + ShadCN UI
│   ├── src/
│   │   ├── components/  # Reusable UI, auth, cart, shop, OCR, AI, admin, delivery components
│   │   ├── pages/       # Home, Login, Signup, Cart, Checkout, Orders, OCR, AI, Profile, Admin
│   │   ├── services/    # API service modules (auth, shop, cart, order, payment, OCR, recommendation)
│   │   ├── store/       # Zustand stores (auth, cart, UI)
│   │   ├── hooks/       # useGeolocation, useDebounce, useIntersectionObserver
│   │   └── lib/         # utils, constants
│   └── ...
├── backend/           # FastAPI + SQLAlchemy + Supabase + Redis
│   ├── app/
│   │   ├── api/v1/      # REST endpoints (auth, shops, products, cart, orders, payments, OCR, recommendations, delivery, admin)
│   │   ├── core/        # Config, database, security, Redis, dependencies
│   │   ├── models/      # SQLAlchemy models (user, shop, product, cart, order, payment, etc.)
│   │   ├── services/    # Email (Brevo), SMS, Razorpay, Maps
│   │   ├── ai/          # LLM (OpenAI/Gemini), OCR (Tesseract/Gemini Vision)
│   │   └── utils/       # Helpers, rate limiter
│   └── ...
└── README.md
```

## Features

### 1. Authentication System
- JWT-based authentication with access + refresh tokens
- Email OTP verification via Brevo SMTP
- Resend OTP with cooldown timer (Redis-based)
- Password hashing with bcrypt
- Rate limiting on OTP APIs via Upstash Redis
- Glassmorphism UI with mobile-first responsive design

### 2. User Location + Smart Shop Detection
- Browser geolocation API with user permission
- **Exact coordinates NEVER sent to LLM** (only approximate area)
- Haversine distance calculation for nearby shop discovery
- Shop recommendation engine (availability, distance, price, delivery optimization)
- Shop cards with ratings, open/closed status, distance display

### 3. Shopping Sections
- 8 categories: Snacks, Kirana, Vegetables, Fruits, Dairy, Beverages, Household, Personal Care
- Product cards with search, filters, sort, quantity selector, wishlist

### 4. Handwritten Grocery List OCR
- Upload handwritten grocery list image
- OCR extraction (Tesseract + Gemini Vision fallback)
- LLM structures extracted text into JSON items
- AI suggestions: "Do you also need milk, tea, biscuits?"
- Editable extracted text with confidence scores
- Drag & drop upload with image preview

### 5. AI Recommendation System
- Smart grocery suggestions based on purchase history
- Healthier alternatives and budget optimization
- Combo suggestions and monthly grocery prediction
- AI assistant chatbot with voice input support
- Hindi + English language support

### 6. Cart System
- Add/remove items with dynamic quantity selector
- Cart saved in database with cross-device sync
- Price calculation, discount system, coupon codes
- Each item: product image, quantity controls, total price, delivery estimate

### 7. Checkout + Payments
- Address selection and management
- Razorpay integration (COD, UPI, Card payments)
- Payment success/failure handling with order confirmation
- Invoice generation

### 8. Delivery Agent System
- Separate roles: Customer, Delivery Agent, Admin
- Delivery dashboard with assigned orders, navigation route
- Pickup/delivery status updates with OTP verification on delivery

### 9. Admin Panel
- Manage users, shops, products, delivery agents
- Analytics dashboard: daily orders, revenue graph, popular items
- Order tracking and management

### 10. Extra Features
- Smart Monthly Basket (AI predicts monthly needs)
- Voice Grocery Input (Web Speech API)
- Family Shared Cart
- AI Budget Mode (cheaper alternatives)
- Recipe-Based Shopping (ingredients auto-added to cart)
- Festival Mode (Diwali/Holi grocery bundles)
- Expiry Tracker
- Repeat Previous Orders
- Subscription Orders (daily milk/bread)
- Offline PWA Support (planned)

## Tech Stack

### Frontend
- React 18 + Vite 5
- Tailwind CSS 3 + ShadCN UI
- React Router 6
- Axios, Zustand
- Framer Motion
- React Hook Form + Zod
- Lucide React Icons
- Recharts (admin analytics)

### Backend
- FastAPI (Python 3.10+)
- JWT Authentication (python-jose)
- Supabase PostgreSQL (SQLAlchemy Async)
- Supabase Storage
- Upstash Redis (caching, rate limiting, queues)
- Brevo SMTP (OTP emails)
- Razorpay Payment Gateway
- OpenAI / Gemini API
- Tesseract OCR + Gemini Vision

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or Supabase account)
- Redis (or Upstash Redis account)
- Brevo API key (email)
- Razorpay account
- OpenAI or Gemini API key

### Environment Setup

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/cartwise
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE=30
REFRESH_TOKEN_EXPIRE=7
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_URL=redis://your-upstash-url
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@cartwise.app
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

### Installation

**Backend:**
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` for the app and `http://localhost:8000/docs` for Swagger API docs.

## API Documentation

Swagger docs available at `/docs` when the backend is running. Key endpoints:

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/signup` | User registration |
| `POST /api/v1/auth/login` | User login |
| `POST /api/v1/auth/verify-otp` | Verify OTP |
| `GET /api/v1/shops/nearby` | Find nearby shops |
| `GET /api/v1/products` | List products with filters |
| `GET /api/v1/cart` | Get user cart |
| `POST /api/v1/orders/create` | Create order |
| `POST /api/v1/ocr/extract` | Extract grocery items from image |
| `GET /api/v1/recommendations` | AI recommendations |

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
vercel --prod
```

### Backend → Render/Railway
```bash
cd backend
# Set environment variables in Render/Railway dashboard
# Start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Database → Supabase
- Create a Supabase project
- Run migrations using Alembic
- Configure Row Level Security policies

## Security
- JWT authentication with refresh tokens
- API rate limiting via Upstash Redis
- Input sanitization and validation (Zod + Pydantic)
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- Environment variables for all secrets
- Secure image uploads
- Exact user coordinates NEVER sent to LLM

## License
MIT
