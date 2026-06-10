# TopUpPay — Gaming Top-up & Payment Portal

TopUpPay is a premium, high-performance digital commerce platform designed for rapid and secure gaming top-ups (e.g., Mobile Legends, PUBG Mobile, Garena Free Fire, Roblox) in Cambodia. It leverages the National Bank of Cambodia's **Bakong KHQR** system for instant, verified peer-to-peer bank transfers.

---

## 🚀 Key Features

*   **⚡ Instant Delivery Automation:** Seamless integration with third-party top-up providers (SmileOne, UniPin, TopUpLive) triggered immediately upon payment verification.
*   **🇰🇭 KHQR & Bakong Integration:** Secure dynamic KHQR generation and automated polling for real-time ABA/Bakong notification confirmation.
*   **🌐 Full Bilingual Localization:** Complete translation support for **English** and **Khmer** namespaces across catalog lists, checkout panels, live notifications, and footer layouts.
*   **🔒 Hardened Security Architecture:** Full CORS restriction, httpOnly JWT authentication with `strict` cookie constraints, base64 file upload filters, rate limiting, and brute-force lockouts.
*   **💎 Gamified Loyalty Program:** Real-time XP tracking (stored in localStorage) yielding automatic VIP tier discount calculations during checkout.
*   **🛠️ Admin Console:** Real-time stats dashboard, game catalog manager (including dynamic "Hot" badges and configuration toggles), and active promo coupon controls.

---

## 📂 Project Architecture

The project is structured as a monorepo containing decoupled frontend and backend services:

```text
top-up/
├── backend/               # ESM-compliant Node.js & Express API Service
│   ├── prisma/            # Database schema definition (MongoDB Provider)
│   └── src/
│       ├── controllers/   # Route handler controllers (stats, transactions, webhooks)
│       ├── middlewares/   # JWT security, rate-limiting, error logging
│       ├── routes/        # Express REST API routing mapping
│       └── services/      # Business logic layer (third-party providers integrations)
│
└── frontend/              # Next.js 15 & React Web Portal (styled via Tailwind CSS v4)
    └── src/
        ├── app/           # Next.js App Router (Games, Loyalty, Support, Admin)
        ├── components/    # Reusable components (Navbar, Footer, Hero, KHQR cards)
        ├── context/       # State contexts (Language, Currency selectors)
        └── services/      # Client-side API request service wrappers
```

---

## ⚙️ Production Readiness Checklist

Before deploying this codebase to production, ensure you complete the following steps:

### 1. Database Configuration
*   **Prisma MongoDB Indexing:** Ensure your MongoDB collection has unique indexes applied on `slug` for `Game` and `code` for `PromoCode` for maximum query performance. Run:
    ```bash
    npx prisma db push
    ```

### 2. Environment Variables Configuration
Create secure `.env` files in production matching the templates:

#### Backend (`backend/.env`)
*   `JWT_SECRET`: Generate a cryptographically strong 128-character hex key:
    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```
*   `ADMIN_PASSCODE`: Set a secure passcode for admin panel access (do not use default placeholders).
*   `FRONTEND_URL`: Set to the production domain (e.g. `https://topuppay.com`) to lock down CORS.
*   `BAKONG_WEBHOOK_SECRET`: Secure token provided by Bakong to verify the validity of incoming bank webhooks.
*   `PORT`: Port for the API server (default `5000`).

#### Frontend (`frontend/.env.local`)
*   `NEXT_PUBLIC_API_URL`: Set to the production backend URL (e.g., `https://api.topuppay.com`).

### 3. Scaling & Session Limits
*   **Rate Limiting:** The built-in rate-limiting and login firewall blocklists run in-memory. If deploying behind load-balancers or multiple container instances, migrate the rate-limiter to use a **Redis store** to maintain cluster-wide state.

---

## 🛠️ Development & Installation

### Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Generate the Prisma client:
    ```bash
    npx prisma generate
    ```
4. Run the development server:
    ```bash
    npm run dev
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Run the development server:
    ```bash
    npm run dev
    ```
    Access the portal at `http://localhost:3000`.

---

## 📝 Security Audits
The application underwent a comprehensive security review resulting in several key hardening measures:
*   ✅ **CORS Origin Restriction** preventing unauthorized cross-site requests.
*   ✅ **Base64 Sanitization & MIME filtering** restricting file uploads to a 5MB size limit and safe image extensions only.
*   ✅ **HTTP-Only Cookies** set with `sameSite: "strict"` and `secure: true` flags to prevent XSS-based token extraction.
*   ✅ **Complete Elimination of Code Fallbacks** ensuring backend APIs fail immediately at launch if environment keys are missing.
