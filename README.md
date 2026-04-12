# Umbra

A full-stack AI chat application built with Next.js. Users sign in with Google, start conversations with an AI assistant, attach images, and have their chat history persisted across sessions.

The AI is impersonating a grumpy dark wizard called Umbra — eccentric, erudite, and reluctantly helpful (but if he is too mean you can customize his tone in the user preferences!).

---

## Stack

**Frontend**

- Next.js 16 (App Router) + React 19
- TypeScript
- SCSS Modules — module scoped stylesheets with a shared variables/mixins layer
- `react-markdown` + `remark-gfm` for parsing LLM markdowns and rendering AI responses.

**Backend / Services**

- **Supabase** — I used Postgres database for users, conversations, messages, and user preferences
- **Groq** — LLM inference (Llama 3.1 for chat, Llama 4 Scout for vision/image analysis)
- **NextAuth v5** — Google OAuth, session management

**Testing**

- Vitest + Testing Library for unit/component tests
- Cypress for end-to-end tests

---

## Features

- Google OAuth sign-in
- Persistent conversation history with a collapsible sidebar
- Search across conversations
- Rename and delete conversations
- Image attachments — images are analysed via a vision model and the extracted description is injected into the prompt
- Personalisation settings — Allow the user to keep persistent information about users across all conversations, or modify the speaking tone of the model
- Streaming AI responses
- Mobile-responsive layout

## Roadmap

- Truncation of long conversation history, summarize context
- Add snackbars and improve error handling, notify users
- Rate limit requests
- Animation enhancements
- Create new route /chats where a user has more options to edit his existing chats
- Add more file support (xls, csv, pdf, etc)
- Add file export capability
- Add voice over feature.
- Archive old conversations

---

## Project Structure

```
src/
  app/
    (chat)/         # chat routes — new chat + conversation pages
    (ui)/           # components, context, hooks
    api/            # route handlers (streaming chat, vision)
    actions.ts      # all server actions (DB reads/writes)
  lib/              # supabase and groq clients
  utils/            # shared helpers
  styles/           # global variables and mixins
  types/            # shared TypeScript types
```

---

## Running Locally

```bash
npm install
npm run dev
```

If you want to set up the project locally you will need to get an API_KEY and relevant informations from the referenced services below to populate an `.env.local` with:

```
NEXTAUTH_SECRET=
NEXTAUTH_URL=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

To run the Cypress e2e suite you also need a `cypress.env.json` in the project root:

```json
{
  "TEST_EMAIL": "your-test-account@gmail.com",
  "TEST_NAME": "Test User",
  "AUTH_SECRET": "<same value as NEXTAUTH_SECRET>",
  "SUPABASE_URL": "<your Supabase project URL>",
  "SUPABASE_ANON_KEY": "<your Supabase anon key>"
}
```

The tests use these to seed a test user directly in Supabase and generate a valid session token without going through the Google OAuth flow.

---

## Notes

This is a portfolio project — the focus was on building something end-to-end with a clean, production-like architecture. State is managed close to where it's used, server actions handle all DB access, and the UI is deliberately fully custom with my own SCSS library without any component library or tailwind.
