# 🛒 Flipkart Clone (Full-Stack E-Commerce)

A full-stack e-commerce web application inspired by Flipkart, featuring a robust frontend user experience and a secure, scalable backend architecture. Ready for deployment on **Vercel** (Frontend) and **Render** (Backend) with a **Neon** PostgreSQL database.

## 🚀 Tech Stack

### Frontend
- **Framework**: React with Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS & Vanilla CSS modules
- **Data Fetching**: Axios

### Backend
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Tech) with `pg` driver
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Other Utilities**: Nodemailer (Email services), Helmet (Security headers)

---

## 🛠 Features

- **User Authentication**: Secure Login/Register with JWT.
- **Product Management**: Browse, view details, specific variants, categories and search products.
- **Shopping Cart**: Add, update quantities, remove items from cart.
- **Wishlist**: Save favorite products for later viewing.
- **Order Management**: Checkout system with address selection and order tracking.
- **Product Reviews**: Add and view user ratings and reviews on detailed product pages.

---

## ⚙️ Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- A PostgreSQL database instance or local setup.

### 1. Clone the Repository
```bash
git clone https://github.com/debughacker420/Flipkart.git
cd Flipkart
```

### 2. Backend Setup
Navigate to the `Backend` directory:
```bash
cd Backend
npm install
```
Create a `.env` file based on the environment variables provided below. Then, start the server:
```bash
npm run dev
# Server will start on http://localhost:8000 by default.
```

### 3. Frontend Setup
In a new terminal, navigate to the `Frontend` directory:
```bash
cd Frontend
npm install
```
Open a `.env` file (if needing a custom API location) and start the frontend:
```bash
npm run dev
# Frontend will start on http://localhost:5173 by default.
```

---

## 🌍 Environment Variables

### Backend (`Backend/.env`)
```env
PORT=8000
NODE_ENV=development
DEFAULT_USER_ID=your-seeded-user-id

# PostgreSQL Configuration (Neon/Local)
DATABASE_URL=postgresql://user:password@host/database?sslmode=verify-full

# JWT & Services
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=30d
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Flipkart Clone <your_email@gmail.com>

# CORS configuration (For Production)
FRONTEND_URL=https://your-frontend-vercel-app.vercel.app
```

### Frontend (`Frontend/.env` - optional for local dev if using Vite proxy)
```env
# For production deployment pointing to your Render backend
VITE_API_URL=https://your-backend-render-app.onrender.com/api
```

---

## 🚢 Deployment Guide

1. **Database:** Create a project natively on [Neon](https://neon.tech), grab your connection string and add it to `.env` as `DATABASE_URL`.
2. **Backend Engine:**
   - Provider: **Render** (Web Service)
   - Build Command: `npm install`
   - Start Command: `node server/index.js`
   - **Environment Variables**: Make sure to include all variables described in the `.env` configuration guide above. Make sure `FRONTEND_URL` points to your final Vercel Domain to ensure CORS does not block requests.
3. **Frontend Application:**
   - Provider: **Vercel**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - **Environment Variables**: Set `VITE_API_URL` to your Render backend link.

---

## 🐛 Bug Fixes & Optimization
- Fixed CORS issues limiting the Frontend from successfully calling the Render-deployed Backend API.
- Re-routed Frontend API Service defaults to leverage dynamic backend deployments (`import.meta.env`).
- Restructured standard `.gitignore` settings to prevent `node_modules` or `.env` leaks to the version control system.
- Corrected potential SQL SSL Connection issues specifically tailored to ensure continuous capability on `neon.tech` Cloud architecture.
