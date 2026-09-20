# API — SmartDesk AI

Base: `/api` — auth via httpOnly `token` cookie. Roles: customer, agent, admin.

| Method | Path | Auth | Body / Query | Response |
|---|---|---|---|---|
| POST | /auth/register | no | name,email,password,role | {id,name,email,role} + cookie |
| POST | /auth/login | no | email,password | {id,name,email,role} |
| GET | /auth/me | yes | — | user |
| POST | /auth/logout | yes | — | ok |
| GET | /tickets?page&limit&status&q | yes | filtered by role | {data,page,total} |
| POST | /tickets | yes | title,description,category | Ticket |
| GET | /tickets/stats | admin | — | {total,open,resolved,urgent,aiResolvedPercent,avgMin} |
| GET | /tickets/:id | yes | — | {ticket,messages} |
| PATCH | /tickets/:id/assign | agent/admin | — | Ticket |
| PATCH | /tickets/:id/status | yes | status | Ticket |
| POST | /tickets/:id/messages | yes | text | Message + socket emit |
| POST | /kb/upload | agent/admin | multipart file+title | {title,chunkCount} |
| GET | /kb | agent/admin | — | docs |
| POST | /ai/triage | yes | ticketId | {priority,sentiment,category,summary} |
| POST | /ai/chat | yes | ticketId,query | {answer,chunkCount} |
| POST | /ai/draft-reply | yes | ticketId | {summary,draftReply} |
| GET | /health | no | — | {ok} |

Socket: `join-ticket`, `send-message`, `new-message`
