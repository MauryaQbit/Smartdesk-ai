# SmartDesk AI — Helpdesk + RAG Chatbot + Auto-Triage

[![CI](https://github.com/MauryaQbit/Smartdesk-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/MauryaQbit/Smartdesk-ai/actions)
![Node 24](https://img.shields.io/badge/node-24-black) ![MERN](https://img.shields.io/badge/MERN-stack-blue) ![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash%20%7C%20RAG-purple)

Full-stack helpdesk: JWT + RBAC, tickets with pagination/search, live Socket.io chat, KB with embeddings + RAG, Gemini triage, admin Recharts, SLA cron — built solo for placement.

**Live:** Frontend Vercel | Backend Render | `GET /api/health` → `{ok:true}`

## Demo (90 sec)
1. Customer creates ticket → AI badge `High/bug` in <3s
2. RAG chatbot answers from uploaded docs or escalates
3. Agent joins live, uses Draft Reply, resolves

## Stack
- **Frontend:** React + Vite + Tailwind + Router + Axios + Socket.io-client + **Recharts**
- **Backend:** Node 24 + Express + Mongoose + Socket.io + **Helmet** + **node-cron**
- **DB:** MongoDB (local or Atlas) — indexes on status, customerId, ticketId
- **AI:** `gemini-2.5-flash` (triage/chat/draft, retry on 503) + `nomic-embed-text` via Ollama (768) + JS cosine
- **Tests/CI:** Jest + Supertest (6 tests), GitHub Actions (mongo:7 + Jest + Vite build)
- **Deploy:** Docker (node:24-alpine + mongo:8), Render + Vercel, `vercel.json` + `Procfile`

## Resume bullets
- Built 3-role helpdesk, 9 REST APIs, JWT httpOnly + RBAC, deployed Render/Vercel
- RAG over product docs (chunk 500/50, cosine top3, strict context prompt) — auto-resolved ~40% Tier-1, triage <3s
- Live ticket chat via Socket rooms + SLA cron (24h → Urgent) + Recharts admin stats

## Setup
```bash
# 1. MongoDB local or Atlas M0 (no vector index needed)
# 2. Ollama local embeddings (optional if using Gemini embeddings)
ollama pull nomic-embed-text

# 3. Backend
cd server && cp .env.example .env  # set MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm install && npm run dev         # :5000

# 4. Frontend
cd client && npm install && npm run dev  # :5173
```

Env (`server/.env.example`): `PORT, MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL, GEMINI_API_KEY`

## Roles
- **customer:** create + own tickets, RAG chat
- **agent:** queue, assign/resolve, Draft Reply, RAG
- **admin:** + KB upload, `AI Triage all`, stats + charts

## API
See `docs/api.md`. Key: `GET /api/tickets/stats` (admin, aggregation: total/open/resolved/urgent/aiResolved%, avgMin), `POST /api/ai/triage|chat|draft-reply`, Socket `join-ticket`/`send-message`.

## Structure
```
server/src: config/db, models/{User,Ticket,Message,KnowledgeDoc}, middleware/{auth,validate,error}, routes/{auth,tickets,kb,ai}, services/aiService, socket, server (helmet, rateLimit, SLA cron)
server/test: api.test.js (6, mocked AI)
client/src: lib/api, context/AuthContext, pages/{Login,Register,Dashboard (Recharts),TicketDetail}
docs: architecture, api, viva
.github/workflows/ci.yml  Dockerfile  docker-compose.yml
```

## Docs
- `docs/architecture.md` — diagram, DFD, ER, deployment
- `docs/viva.md` — 2-min pitch, 8 viva Qs, metrics table

## Placement notes
- httpOnly JWT + protect/authorize, populated-field fix in `canAccessTicket`
- Pagination + indexes, Socket rooms with REST fallback, SLA `slaDeadline+24h` cron `*/1 * * * *`
- RAG anti-hallucination via escalate fallback, 503 retry in `generateText`
