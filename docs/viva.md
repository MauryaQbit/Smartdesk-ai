# Viva Prep — SmartDesk AI

## 2-min pitch
Support teams drown in repetitive tickets. SmartDesk triages instantly (priority/sentiment/category) and tries RAG auto-resolve from company docs before human steps in. If unsure, escalates with summary + draft reply. Cuts Tier-1 load.

## Must-answer (external)
1. **RAG 4 steps:** chunk 500/50 → nomic-embed-text (768) → cosine top3 → Gemini with strict "only from context" else escalate.
2. **Anti-hallucination:** system prompt + escalate fallback + no KB → chunkCount 0.
3. **JWT+RBAC:** httpOnly cookie, protect middleware verifies, authorize('admin','agent'), canAccessTicket handles populated field.
4. **Socket:** room=ticketId, auth via cookie in handshake, REST fallback if missed, io stored on app.
5. **Why cosine over Atlas?** Free, no index, works locally; trade-off: O(n) scan but fine for viva scale.
6. **SLA:** slaDeadline = createdAt+24h, cron `*/1 * * * *` → Urgent.
7. **Scale 10k:** add pagination index, cache embeddings, queue triage, sticky sessions.
8. **Tests:** 6 Jest (register, login, create ticket, auth block, RBAC, triage mock). CI runs on push.

## Metrics for report
| Metric | Manual | AI |
|---|---|---|
| Triage time | ~2 min | <3s |
| Avg first response | hours | seconds (socket) |
| Tier-1 auto-resolved | 0% | ~40% (20 sample tickets) |

## PPT outline
Problem → Demo GIF → Arch → Data flow → AI flow → Results table → Future (Redis, queue, Docker already done)
