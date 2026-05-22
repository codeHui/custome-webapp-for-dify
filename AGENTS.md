# AGENTS.md

## Project Identity

This repository is a Next.js App Router web client for a Dify conversation application.

The codebase owns:

- the browser UI and interaction model
- local conversation and input orchestration
- streaming response rendering
- a thin backend-for-frontend layer under `app/api/*`

The codebase does not own the core AI workflow engine, durable conversation storage, or application logic execution. Those responsibilities are delegated to Dify through `dify-client`.

## Stack And Runtime

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS and Sass
- i18next for localization
- `dify-client` for upstream API access

Use `pnpm` as the default package manager because the repository includes `pnpm-lock.yaml`.

Useful commands:

- `pnpm dev`
- `pnpm build`
- `pnpm fix`

## Configuration Surface

Environment variables:

- `NEXT_PUBLIC_APP_ID`
- `NEXT_PUBLIC_APP_KEY`
- `NEXT_PUBLIC_API_URL`

Repository configuration:

- `config/index.ts` defines app metadata, locale defaults, prompt display flags, and API prefixing.

## Architecture Overview

### Frontend Architecture

The frontend is centered around a single client shell.

- `app/page.tsx` is the route entry and delegates immediately to `app/components/index.tsx`.
- `app/components/index.tsx` is the main application shell. It bootstraps app parameters and conversation history, manages the active conversation, handles streaming message updates, tracks workflow execution, and coordinates the major UI regions.
- `hooks/use-conversation.ts` owns conversation-local state such as the current conversation ID, new vs. existing conversation input state, and the `localStorage` mapping between app ID and last-opened conversation.
- `service/index.ts` defines the frontend-facing API methods.
- `service/base.ts` is the networking core. It builds requests to local `/api/*` endpoints, handles timeouts, and parses server-sent events for message chunks, agent thoughts, files, workflow lifecycle events, and node tracing.
- `app/components/welcome/index.tsx` renders the pre-chat configuration experience. It turns Dify application parameters into prompt-variable input controls and gates the start of a new conversation.
- `app/components/chat/*` renders the conversation timeline, composer, markdown answers, attachments, and feedback interactions.
- `app/components/workflow/*` renders workflow progress and node-level execution details when the upstream response includes workflow tracing.
- `i18n/*` provides server-side locale resolution and client-side language setup.

This is primarily a client-driven application. Most business state lives in the browser shell and is synchronized from Dify responses.

### Backend Architecture

The backend in this repository is a thin Next.js BFF layer, not a standalone business backend.

- `app/api/utils/common.ts` creates the Dify `ChatClient`, derives a stable per-session user ID in the form `user_<APP_ID>:<session_id>`, and applies the session cookie.
- Route handlers translate browser requests into Dify API calls and return the upstream result with minimal transformation.

Current route surface:

- `POST /api/chat-messages`: starts a streaming chat response.
- `GET /api/conversations`: loads the current session user's conversation list.
- `POST /api/conversations/[conversationId]/name`: renames a conversation or triggers auto-generated naming.
- `GET /api/messages?conversation_id=...`: loads message history for a conversation.
- `POST /api/messages/[messageId]/feedbacks`: submits message feedback.
- `GET /api/parameters`: fetches application parameters, opening statement, and upload capabilities.
- `POST /api/file-upload`: uploads files before they are referenced by messages or prompt inputs.

Important constraints:

- there is no internal database in this repo
- there is no queue, worker, or background job subsystem
- there is no custom authentication provider beyond a session cookie used to build the upstream Dify user identity
- durable conversation state lives upstream in Dify, not locally

### Business Architecture

This product is best understood as a branded conversation workspace for a configured Dify app.

Core business entities:

- App configuration: title, locale, copyright, privacy policy, prompt visibility.
- Prompt variables: structured user inputs required before the first message.
- Conversation: a chat thread tied to a Dify session-scoped user identity.
- Message: a user query plus a streamed assistant response.
- Attachments: images or files attached either as prompt inputs or message payloads.
- Feedback: per-message rating submitted back to Dify.
- Workflow trace: optional execution metadata for workflow- or agent-style responses.

Source-of-truth split:

- Browser: transient UI state, active conversation selection, and app-to-conversation mapping in `localStorage`.
- Next.js BFF: request shaping, session continuity, and upstream proxying.
- Dify: application parameters, conversations, messages, files, response streaming, workflow execution, and generated conversation names.

## Primary User Flows

### 1. App Bootstrap

- The main shell fetches application parameters and conversation history in parallel.
- It restores the last-opened conversation for the current app ID when available.
- It initializes prompt-variable metadata, upload capabilities, and the default opening state.

### 2. New Conversation Setup

- The welcome scene renders the prompt-variable form from Dify's `user_input_form`.
- Required inputs must be present before the user can enter the chat flow.
- A local placeholder conversation is created before the first upstream response returns the actual conversation ID.

### 3. Message Send And Streaming Response

- The user sends text and optional attachments.
- The frontend posts to `POST /api/chat-messages`.
- `service/base.ts` parses streaming events and incrementally updates the UI with answer chunks, agent thoughts, files, workflow status, and node execution details.

### 4. Conversation Continuity

- Once the first response returns a real conversation ID, the client stores it in `localStorage` under the current app ID.
- The sidebar reflects the current conversation list.
- The client can fetch historical messages when the user switches conversations.

### 5. Feedback And Follow-Up Turns

- Users can rate assistant messages through the feedback endpoint.
- Follow-up prompts stay within the current Dify conversation unless the user explicitly starts a new chat.

## Change Guidance For Agents

- Preserve the thin-proxy architecture. New upstream capabilities should usually be added in three places: `app/api/*`, `service/*`, and the owning UI slice.
- Keep business state in the client shell or dedicated hooks, not inside route handlers.
- Treat Dify as the system of record. Avoid introducing local persistence unless the feature explicitly requires it.
- When extending streaming behavior, update both `service/base.ts` and the affected UI types in `types/*`.
- Keep user-facing configuration in `config/index.ts` and Dify application parameters rather than hard-coding values in components.
- Reuse existing types from `types/app.ts`, `types/log.ts`, and the chat component types before introducing new shapes.
- Maintain localization coverage for any new visible labels.

## Fast File Map

- `app/components/index.tsx`: main app shell and orchestration
- `hooks/use-conversation.ts`: conversation state model
- `service/base.ts`: fetch and SSE parsing
- `service/index.ts`: frontend API wrapper
- `app/api/utils/common.ts`: Dify client and session identity
- `app/api/*`: BFF proxy endpoints
- `app/components/welcome/*`: pre-chat input and app intro scene
- `app/components/chat/*`: message timeline and composer
- `app/components/workflow/*`: workflow trace rendering
- `types/app.ts`: main domain types
- `utils/prompt.ts`: prompt-variable transformation helpers

## Practical Editing Rules

- If the feature changes how messages stream or render, start with `service/base.ts` and `app/components/index.tsx`.
- If the feature changes pre-chat user input, start with `app/components/welcome/index.tsx`, `utils/prompt.ts`, and `types/app.ts`.
- If the feature introduces a new upstream Dify endpoint, mirror it through `app/api/*` first and then expose it via `service/index.ts`.
- If the feature adds visible business concepts, define clearly whether the source of truth is browser state, the BFF layer, or Dify.
