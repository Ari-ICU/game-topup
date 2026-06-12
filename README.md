# TopUpPay — Gaming Top-up & Payment Portal

TopUpPay is a premium, high-performance digital commerce platform designed for rapid and secure gaming top-ups (e.g., Mobile Legends, PUBG Mobile, Garena Free Fire, Roblox) in Cambodia. It leverages the National Bank of Cambodia's **Bakong KHQR** system for instant, verified peer-to-peer bank transfers, and integrates advanced enterprise-grade architecture.

---

## 🚀 Key Features

*   **⚡ Instant Delivery Automation:** Seamless integration with third-party top-up providers (SmileOne, UniPin, TopUpLive) triggered immediately upon payment verification.
*   **🇰🇭 KHQR & Bakong Integration:** Secure dynamic KHQR generation and automated polling for real-time ABA/Bakong notification confirmation.
*   **🔄 Background Job Queues (BullMQ):** Offloads asynchronous operations (e.g., top-up order fulfillment, retry logic, provider communication) to a dedicated Redis-backed background worker queue.
*   **🚀 Redis-Backed Rate Limiting:** Hardened APIs featuring distributed rate limiting via Redis to prevent brute-force attacks and abuse.
*   **🔒 Secure Refresh Token Authentication:** Secure dual-token JWT mechanism utilizing short-lived Access tokens and HTTP-only, `strict` cookie-bound Refresh tokens.
*   **👥 Role-Based Access Control (RBAC):** Granular authorization roles (`ADMIN`, `STAFF`, `USER`) protecting secure routes, catalog updates, and administrative overrides.
*   **🤖 Telegram Bot Integration:** 
    *   **Alert System:** Real-time push notifications to a Telegram channel for key events (completed/failed/pending transactions).
    *   **Admin Commands:** Manage operations via `/stats` (today's sales volume, breakdown) and `/status <transactionId>` (lookup specific transactions).
*   **📊 Database Transactions & Decimals:** 
    *   **ACID Compliance:** Multi-document MongoDB transactions via Prisma Client (running on a MongoDB Replica Set).
    *   **Precision Financials:** Uses `decimal.js` for all monetary calculations, preventing JavaScript floating-point errors.
*   **📖 Swagger/OpenAPI Documentation:** Complete interactive endpoint definitions accessible directly via Swagger UI.
*   **🌐 Full Bilingual Localization:** Complete translation support for **English** and **Khmer** namespaces across catalog lists, checkout panels, live notifications, and footer layouts.
*   **🛠️ Admin Console:** Real-time stats dashboard, game catalog manager (including dynamic "Hot" badges and configuration toggles), and active promo coupon controls.

---

## 📂 Project Architecture

The project is structured as a monorepo containing decoupled frontend and backend services:

```text
top-up/
├── backend/               # ESM-compliant Node.js & Express API Service (TypeScript)
│   ├── prisma/            # Database schema definition (MongoDB Provider)
│   └── src/
│       ├── config/        # Swagger setup, DB, and client config
│       ├── controllers/   # Route handler controllers (stats, transactions, webhooks)
│       ├── middlewares/   # JWT security, RBAC authorization, rate-limiting, error logging
│       ├── routes/        # Express REST API routing mapping
│       ├── services/      # Business logic layer (third-party providers, transactions)
│       ├── tests/         # Unit and Integration test suite (Jest & Supertest)
│       ├── utils/         # Telegram helpers, decimal utilities, logger
│       └── workers/       # BullMQ fulfillment queue workers
│
└── frontend/              # Next.js 15 Web Portal (React 19 & styled via Tailwind CSS v4)
    └── src/
        ├── app/           # Next.js App Router (Games, Loyalty, Support, Admin)
        ├── components/    # Reusable components (Navbar, Footer, Hero, KHQR cards)
        ├── context/       # State contexts (Language, Currency selectors)
        └── services/      # Client-side API request service wrappers
```

---

## 🛠️ Installation & Setup

### Requirements
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [MongoDB](https://www.mongodb.com/) configured as a **Replica Set** (required for Prisma MongoDB transactions)
- [Redis](https://redis.io/) (for BullMQ queues and rate limiting)

---

### Local Development Setup

#### 1. Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure your Environment variables (see [Environment Variables Configuration](#environment-variables-configuration)).
4. Generate the Prisma client and push the schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5. Seed the database with default games and catalog data:
    ```bash
    npm run seed
    ```
6. Run the development server:
    ```bash
    npm run dev
    ```
    *The API server runs on port `5001` (by default).*

#### 2. Frontend Setup
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
    *Access the client portal at `http://localhost:3000`.*

---

### Docker Compose Orchestration

To run the entire ecosystem (MongoDB Replica Set, Redis cache, BullMQ backend, and Next.js frontend) with a single command, run:

```bash
docker-compose up --build
```

#### Services Spawned:
*   `topup_mongodb`: MongoDB instance running with `--replSet rs0`.
*   `topup_mongodb_setup`: One-off script initializing the MongoDB replica set.
*   `topup_redis`: Redis server for queues and rate-limiting.
*   `topup_backend`: Node.js Express service accessible at `http://localhost:5001`.
*   `topup_frontend`: Next.js web application accessible at `http://localhost:3000`.

---

## ⚙️ Environment Variables Configuration

Create secure `.env` files in development/production matching the templates:

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | API Server running port | `5001` |
| `NODE_ENV` | Running Environment | `development` or `production` |
| `DATABASE_URL` | MongoDB URI (must include Replica Set parameter) | `mongodb://localhost:27017/topup?replicaSet=rs0` |
| `REDIS_URL` | Connection URL for Redis cache & queues | `redis://localhost:6379` |
| `ADMIN_PASSCODE` | Secure passcode for initial Admin login | `YourSecurePasscode123!` |
| `JWT_SECRET` | 128-character cryptographically strong hex key | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `BAKONG_ACCOUNT_ID` | National Bank of Cambodia Bakong Account | `your_account@bank` |
| `BAKONG_API_TOKEN` | Bakong API Authentication Token | `your_bakong_token` |
| `BAKONG_WEBHOOK_SECRET`| Token to verify signatures on incoming notifications | `your_webhook_signature_secret` |
| `SMILEONE_EMAIL` | SmileOne provider integration email | `your_email` (Optional) |
| `SMILEONE_API_KEY` | SmileOne provider API Key | `your_key` (Optional) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot API key from @BotFather | `your_bot_token` (Optional) |
| `TELEGRAM_CHAT_ID` | Chat/Channel ID to post logs and alerts to | `your_chat_id` (Optional) |
| `TELEGRAM_ADMIN_USERNAMES`| Comma-separated telegram handles authorized for commands | `username1,username2` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Public endpoint of the backend API server | `http://localhost:5001` |

---

## 🧪 Testing Suite

The application includes robust Unit and Integration testing environments using Jest and Supertest.

Run all tests:
```bash
cd backend
npm run test
```

- **Unit Tests:** Mock database and provider responses to test services (`backend/src/tests/unit/`).
- **Integration Tests:** Test HTTP endpoints, middleware validation pipelines, and role-based permissions (`backend/src/tests/integration/`).

---

## 📝 Interactive API & Security Hardening

### Swagger API Documentation
When running the backend service locally or in staging, navigate to:
```text
http://localhost:5001/api-docs
```
This serves a fully interactive Swagger UI to review all REST endpoints, schemas, authorization requirements, and test requests directly.

### Security Audit Hardening Highlights
*   🔒 **Strict CORS Policies:** Origin restrictions locking API access to specified frontends.
*   🔒 **Secure Cookie Policies:** JWT tokens stored in HTTP-Only, Secure cookies with `SameSite: strict` properties.
*   🔒 **Robust Global Rate Limiting:** Redis-backed request limiters with dynamic lockouts.
*   🔒 **Input Validation:** Strict payload validation using Zod schemas on all incoming routes.
*   🔒 **Fail-Fast Initialization:** The system refuses to boot up if required environment variables (`JWT_SECRET`, `ADMIN_PASSCODE`, `DATABASE_URL`) are undefined.
