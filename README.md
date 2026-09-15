# SmartDesk AI — Helpdesk + RAG Chatbot + Auto-Triage

Full-stack MERN project: JWT + RBAC auth, Tickets + pagination/search, live Socket.io chat, Knowledge Base with local embeddings, RAG chatbot, and LLM-powered auto-triage — all running locally via Ollama (no API keys needed).

## Stack
Frontend: React + Vite + Tailwind + React-Router + Socket.io-client + Axios
Backend: Node + Express + Mongoose + Socket.io
DB: MongoDB (local or Atlas)
AI: Ollama (llama3.1:8b for text, nomic-embed-text for embeddings) — runs locally
Vector Search: Cosine similarity in JS (no Atlas vector index required)
Deploy: Render Backend + Vercel Frontend

## Prerequisites
1. Install [Ollama](https://ollama.com/) and pull models:
   ```
   ollama pull llama3.1:8b
   ollama pull nomic-embed-text
   ```
2. Ollama must be running on `http://localhost:11434` (default)

## Setup
1. MongoDB: local `mongodb://127.0.0.1:27017/smartdesk-ai` or Atlas M0.
   No vector index needed — cosine similarity runs in JS.
2. Backend:
   ```
   cd server
   cp .env.example .env
   # Edit .env: set MONGO_URI and OLLAMA_URL (default http://localhost:11434)
   npm install
   npm run dev
   ```
3. Frontend:
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```
Open http://localhost:5173, API http://localhost:5000/api/health

## Roles
- **customer**: Create tickets, view own tickets, use RAG chat on ticket
- **agent**: See all open tickets, assign/resolve/close, AI Triage button, Draft Reply, RAG chat
- **admin**: Everything agents can do + upload KB docs, AI triage all open tickets

## API Reference
### Auth
- `POST /api/auth/register` {name, email, password, role}
- `POST /api/auth/login` {email, password}
- `GET /api/auth/me` (protected)
- `POST /api/auth/logout` (protected)

### Tickets
- `GET /api/tickets?page&limit&status&q` (paginated + search)
- `POST /api/tickets` {title, description, category}
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id/assign` (agent/admin)
- `PATCH /api/tickets/:id/status` {status: open|assigned|resolved|closed}
- `POST /api/tickets/:id/messages` {text}

### Knowledge Base (admin/agent)
- `POST /api/kb/upload` multipart form {title, file (.txt/.md/.json/.csv)}
- `GET /api/kb` (list docs)

### AI (protected)
- `POST /api/ai/triage` {ticketId} — returns priority, sentiment, category, summary
- `POST /api/ai/chat` {ticketId, query} — RAG chatbot, returns answer + chunkCount
- `POST /api/ai/draft-reply` {ticketId} — summarize thread + draft agent reply

### Socket.io events
- `join-ticket(ticketId)` — join room
- `send-message({ticketId, text})` — emit message
- `new-message(msg)` — receive new message

## Structure
server/src: config/db.js, models/User/Ticket/Message/KnowledgeDoc, middleware/auth+validate+error, routes/auth/tickets/kb/ai, services/aiService.js (Ollama client + cosine similarity), socket.js, server.js
client/src: lib/api.js, context/AuthContext.jsx, pages/Login/Register/Dashboard/TicketDetail

## Placement notes
- httpOnly JWT cookie + protect/authorize RBAC middleware
- Pagination + indexes on status, createdAt, customerId
- Socket.io rooms per ticketId with JWT auth + REST fallback
- RAG: embed query → cosine similarity top 3 chunks → LLM with strict "only from context" prompt → hallucination prevention via "Escalating to human" fallback
- Auto-triage: LLM structured JSON classification on ticket creation
- SLA deadline default 24h
- Zero API cost — runs entirely on local Ollama
