Single-agent mode is still supported as a fallback:

```dotenv
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1
NEXT_PUBLIC_APP_ID=your-app-id
NEXT_PUBLIC_APP_KEY=app-your-app-key
```

When multiple agents are configured, the app renders a collapsible panel on the far left so users can switch between agents. Conversation continuity remains scoped by Dify app ID, and the visible agent list is filtered by RBAC.


---
The app now uses a local JWT-authenticated backend proxy for Dify. The browser only talks to the Next.js API routes, and agent API keys stay on the server.

---
RBAC Notes:
- `roles.<role>.agents` can reference an agent by generated ID, agent name, or Dify `appId`.
- If you do not provide an explicit `id` in `NEXT_PUBLIC_AGENT_CONFIGS`, agent IDs are generated from the agent name. For the default example above, `Agent 1 -> agent-1` and `Agent 2 -> agent-2`.