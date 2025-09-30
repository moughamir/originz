# Chat Widget MVP Plan

This branch scaffolds the initial structure for a live chat widget according to the spec. It does not change runtime paths or break the current site.

What’s included
- Types: types/chat.d.ts, types/agent.d.ts, types/integration.d.ts
- Hooks: hooks/useChat.ts (state, persistence), hooks/useWebSocket.ts (placeholder)
- Component: app/(customer)/chat/ChatWidget.tsx (open/closed/minimized)
- API: app/api/chat/start/route.ts (mock session)
- Env: NEXT_PUBLIC_WS_URL and SENDGRID_API_KEY placeholders in .env.sample and .env.example

Next steps (Phase 1 MVP)
- Implement /api/chat/message and /api/chat/history endpoints
- Wire basic WebSocket events for message send/receive
- Persist sessions/messages (Prisma or Supabase)
- Add TypingIndicator and MessageList components
- Add agent status endpoint /api/chat/agents/status

Notes
- Tailwind v3 is currently used in this repo. We can upgrade to v4 in a dedicated branch if desired.
- No UI references were added to layout; ChatWidget isn’t mounted globally yet.
