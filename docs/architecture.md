# Architecture — SmartDesk AI

```
Client (React + Vite) ──Axios/Socket.io──► Express API ──Mongoose──► MongoDB
  │  Redux-less AuthContext          │                              │
  │  Recharts Dashboard              │  JWT httpOnly + RBAC          │  Users
  │  Live chat (Socket.io room)      │  Rate limit 300/15m + 20/m AI │  Tickets (indexes: status, customerId)
                                     │  Helmet, validation, SLA cron │  Messages (ticketId, sender)
                                     │                              │  KnowledgeDoc (embeddingVector 768)
                                     └─► aiService ──► Gemini 2.5 Flash (text)
                                                      └─► Ollama nomic-embed-text (768) + cosine JS
```

**Key decisions:**
- Atlas Vector Search avoided — JS cosine over stored vectors keeps MERN + free tier.
- `gemini-2.5-flash` + retry on 503; embeddings via local Ollama to save quota.
- Socket rooms `ticketId`, auth via JWT cookie, REST fallback for messages.

## DFD Level 0/1
- L0: Customer/Agent/Admin → SmartDesk → DB/AI
- L1: Ticket lifecycle open→assigned→resolved→closed; SLA cron escalates to Urgent.

## ER
User(1)—*Ticket—*Message; User—*KnowledgeDoc; Ticket—*Message

## Deployment
Render (server) + Vercel (client) or Docker Compose (app + mongo:8). CI runs Jest + Vite build.
