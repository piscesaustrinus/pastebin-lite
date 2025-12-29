# Pastebin-Lite

A high-performance, serverless Pastebin clone built to handle ephemeral text storage with dual-constraint logic (TTL and View Limits). This project was developed as a technical assessment for a Data Engineering role.

## 🚀 Deployed Application
**URL:** https://pastebin-lite-hrgjx4tfl-piscesaustrinus-projects.vercel.app

---

## 🛠 Tech Stack & Design Decisions

### Persistence Layer: Upstash Redis
I chose **Upstash Redis** as the persistence layer for several strategic reasons:
* **Serverless Compatibility:** Unlike in-memory storage, Redis persists data across stateless Vercel function executions.
* **Atomic Operations:** I utilized `HINCRBY` to manage view counts. This ensures that even under concurrent load, the "max views" constraint is enforced accurately without race conditions.
* **Performance:** Redis offers sub-millisecond latency, allowing the `/api/healthz` endpoint to respond quickly as required.



### Key Design Decisions
* **Deterministic Time Testing:** Implemented a helper function `getNow()` that prioritizes the `x-test-now-ms` header when `TEST_MODE=1` is active, allowing for reliable automated expiry testing.
* **Hybrid Routing:** * `/api/pastes/[id]` provides raw data and metadata for programmatic access.
    * `/p/[id]` provides a clean, server-rendered HTML view for end-users.
* **Security:** Content is rendered safely in Next.js to ensure arbitrary text is displayed without risk of script execution.

---

## 💻 Local Development

Follow these steps to run the project on your machine:

### 1. Prerequisites
* Node.js (v18 or higher)
* An Upstash Redis database account

### 2. Installation
```bash
git clone [https://github.com/piscesaustrinus/pastebin-lite.git](https://github.com/piscesaustrinus/pastebin-lite.git)
cd pastebin-lite
npm install

3. Environment Setup
Create a file named .env.local in the root of the project and add your Upstash credentials:

Plaintext

UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
TEST_MODE=1
4. Available Commands
Development Mode: npm run dev (Starts the app on http://localhost:3000)

Production Build: npm run build (Compiles the Next.js application)

Production Start: npm run start (Runs the built application)

🧪 API Documentation
Health Check
GET /api/healthz

Returns {"ok": true} if the persistence layer is reachable.

Create a Paste
POST /api/pastes

Required Body: { "content": "string" }

Optional: ttl_seconds (int), max_views (int)

Fetch Metadata (API)
GET /api/pastes/:id

View Paste (HTML)
GET /p/:id

📁 Repository Requirements Check
[x] README.md at root with description and local setup.

[x] No Secrets: Credentials managed via environment variables.

[x] No Global Mutable State: Persistence handled entirely by Redis.

[x] Safe Rendering: XSS protection implemented via standard React/Next.js rendering patterns.