# SmartDesk AI — Month 1 (MERN Base for Placement)

Hireable helpdesk base: JWT + RBAC, Tickets + pagination/search, live ticket chat via Socket.io.
Month 2 adds RAG chatbot + auto-triage. Month 3 adds admin stats + tests.

## Run locally
1. MongoDB: local `mongodb://127.0.0.1:27017/smartdesk-ai` or Atlas.
2. Backend:
```
cd server
cp .env.example .env
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

## Accounts
Register as `customer` to create tickets, as `agent` to assign/resolve. First `admin` can be registered once via API `role=admin`, further admin creation is blocked.

## API (Month 1)
- POST /api/auth/register, /login, /logout, GET /me
- GET /api/tickets?page&limit&status&q, POST /api/tickets
- GET /api/tickets/:id, PATCH /:id/assign (agent/admin), PATCH /:id/status, POST /:id/messages
- Socket: `join-ticket`, `send-message`, `new-message`

## Structure
server/src: config/db.js, models/, middleware/auth+validate+error, routes/, socket.js, server.js
client/src: lib/api.js, context/AuthContext.jsx, pages/Login/Register/Dashboard/TicketDetail

## Placement notes
Talking points: httpOnly JWT cookie + protect/authorize middleware, pagination + indexes, Socket rooms per ticketId with auth + REST fallback, SLA deadline default 24h.
