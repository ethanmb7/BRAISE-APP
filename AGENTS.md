# SAPIE — Base44 Dev Environment

## What this is
A Vite + React + TypeScript SPA ("SAPIE"), a gamified study/revision app for teens (11–18). French UI. No backend server — pure frontend with optional Supabase + Mistral AI integrations.

## Running it
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Web entry: http://localhost:3000 (mapped to Vite's 5173 inside the container)
- `npm install` runs automatically at container startup
- Vite dev server with HMR — edits appear live without rebuilds

## External services (all optional — app boots without them)
- **Supabase** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`): database/auth/storage. When unset, `supabaseConfigured` is false and the app falls back to localStorage persistence. No crash.
- **Mistral AI** (`VITE_MISTRAL_API_KEY`): powers the "Braise" chat tutor. When unset, chat returns a friendly error message. Note: `.env.example` mentions `VITE_GEMINI_API_KEY` but the actual code (`src/lib/chat.ts`) uses `VITE_MISTRAL_API_KEY`.

## Key architecture notes
- State management via React Context (`src/store.tsx`) with localStorage persistence (`src/lib/persist.ts`)
- `src/lib/supabase.ts` conditionally creates the Supabase client — `null` when unconfigured
- SM2 spaced-repetition algorithm for flashcard reviews
- Onboarding is currently skipped (initial view is 'home', see comment in `store.tsx`)

## Vite config
`vite.config.ts` has `server.host: true` and `server.allowedHosts: true` to accept the preview's external hostname.

## Tests
```bash
docker compose -f docker-compose.base44.yml exec web npx vitest run
```
