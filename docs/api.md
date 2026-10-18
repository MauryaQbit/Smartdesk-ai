# API — SmartDesk AI

Base: `/api` — auth via httpOnly `token` cookie. Roles: customer, agent, admin.

| Method | Path | Auth | Body / Query | Response |
|---|---|---|---|---|
| POST | /auth/register | no | name,email,password,role | {id,name,email,role} + cookie |
| POST | /auth/login | no | email,password | {id,name,email,role} |
| GET | /auth/me | yes | — | user |
| POST | /auth/logout | yes | — | ok |
| GET | /tickets?page&limit&status&q&assignedTo&overdue | yes | filtered by role and queue | {data,page,total} |
| POST | /tickets | yes | title,description,category | Ticket |
| GET | /tickets/stats | admin | — | {total,open,resolved,urgent,aiResolvedPercent,avgMin} |
| GET | /tickets/export.csv | agent/admin | — | CSV export of tickets |
| GET | /tickets/audit | admin | — | Latest 100 audit records |
| GET | /tickets/:id | yes | — | {ticket,messages} |
| POST | /tickets/:id/satisfaction | ticket customer | rating,comment | Satisfaction response |
| GET | /tickets/:id/satisfaction | ticket participant | — | Satisfaction response or null |
| PATCH | /tickets/:id/assign | agent/admin | — | Ticket |
| PATCH | /tickets/:id/status | yes | status | Ticket |
| POST | /tickets/:id/messages | yes | text | Message + socket emit |
| POST | /tickets/:id/notes | agent/admin | text | Private internal note |
| PATCH | /tickets/bulk-status | agent/admin | ids,status | Bulk status update |
| POST | /kb/upload | agent/admin | multipart file+title | {title,chunkCount} |
| GET | /kb | agent/admin | — | docs |
| DELETE | /kb/:id | agent/admin | — | Delete a knowledge document and its chunks |
| POST | /ai/triage | yes | ticketId | {priority,sentiment,category,summary} |
| POST | /ai/chat | yes | ticketId,query | {answer,chunkCount} |
| POST | /ai/feedback | yes | messageId,helpful | Persist AI answer helpfulness feedback |
| POST | /ai/escalate | yes | ticketId | Notify support staff about a human handoff |
| POST | /ai/draft-reply | yes | ticketId | {summary,draftReply} |
| GET | /health | no | — | {ok} |

Socket: `join-ticket`, `send-message`, `new-message`
