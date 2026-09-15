# SmartDesk AI — Helpdesk + RAG Chatbot + Auto-Triage

Full-stack MERN project: JWT + RBAC auth, Tickets + pagination/search, live Socket.io chat, Knowledge Base with Atlas Vector Search, RAG chatbot, and Gemini-powered auto-triage.

## Stack
Frontend: React + Vite + Tailwind + React-Router + Socket.io-client + Axios
Backend: Node + Express + Mongoose + Socket.io
DB: MongoDB Atlas (M0 free, supports `$vectorSearch`)
AI: Gemini 1.5 Flash (`text-embedding-004` for embeddings, `gemini-1.5-flash` for text)
Deploy: Render Backend + Vercel Frontend

## Setup
1. MongoDB: local `mongodb://127.0.0.1:27017/smartdesk-ai` or [Atlas M0 free](https://www.mongodb.com/atlas/database).
   **For Atlas Vector Search** create a search index on `KnowledgeDoc` collection named `vector` with:
   - type: vector
   - fields: `embeddingVector` (numDimensions: 768, similarity: cosine)
2. Get Gemini API key: [https://makersuite.google.com/](https://makersuite.google.com/)
3. Backend:
   ```
   cd server
   cp .env.example .env
   # Edit .env: set MONGO_URI and GEMINI_API_KEY
   npm install
   npm run dev
   ```
4. Frontend:
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
server/src: config/db.js, models/User/Ticket/Message/KnowledgeDoc, middleware/auth+validate+error, routes/auth/tickets/kb/ai, services/aiService.js, socket.js, server.js
client/src: lib/api.js, context/AuthContext.jsx, pages/Login/Register/Dashboard/TicketDetail

## Placement notes
- httpOnly JWT cookie + protect/authorize RBAC middleware
- Pagination + indexes on status, createdAt, customerId
- Socket.io rooms per ticketId with JWT auth + REST fallback
- RAG: embed query → Atlas `$vectorSearch` top 3 chunks → Gemini with strict "only from context" prompt → hallucination prevention
- Auto-triage: Gemini structured JSON classification on ticket creation
- SLA deadline default 24h
