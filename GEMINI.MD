# Agent Constitution & Project Rules
# PromptWars Edition — Antigravity-native. Judge-aligned. Competition-ready.

## 🎯 Global Context

# FILL THIS IN FIRST — complete within 60 seconds of challenge reveal
- **Project Goal:** VidyaAI — an adaptive learning companion that teaches 
  any concept using Gemini, adjusts explanation depth based on quiz 
  performance, and tracks topic mastery in real time

- **Target User:** Arjun — a college student in Tier-2 India preparing 
  for competitive exams, overwhelmed by static content that doesn't 
  adapt to what he actually understands

- **Domain:** Education

- **Core AI Feature:** Adaptive explanation engine — Gemini generates a 
  Level 1 explanation, auto-creates 2 comprehension questions, then 
  upgrades to Level 2 (deeper + examples) if the user scores below 50%, 
  or unlocks the next related concept if they pass. Every session updates 
  a live mastery score in Firestore.
  
- **Primary Objective:** Ship a functional, high-polish MVP within the hackathon timeframe. 

- **Judge Lens:** Every feature must be demo-able in under 30 seconds, explainable
  in one sentence, and show visible AI doing real work — not decorating UI. 
  **CRITICAL:** NEVER break the happy path for edge-case handling. Judges only see what works.
  **CRITICAL:** NEVER show raw AI output (JSON, error messages, etc.). All output must be pretty-printed and human-readable.
  **CRITICAL:** NEVER expose API keys or other secrets in the UI or logs.
  **CRITICAL:** NEVER hardcode API keys or other secrets in the source code.
  **CRITICAL:** NEVER generate a long or complex file path when running any command (like mkdir, cd, cp, etc.). Always use short and simple paths. If a path needs multiple directories, suggest creating all directories in a single command or breaking it down into minimal, simple steps. Do not generate long or complex path names.
- **Judging Criteria (memorise):**
  1. Solution Quality — does it solve a real problem with a working demo
  2. Prompt Architectural Elegance — quality of agent direction visible in Artifacts
  3. Live Pitch — 5–7 min demo that narrates what was built and why it works

## 🔍 Challenge Intake Protocol

# Run this the moment the challenge is revealed. Do not skip it.
When I describe the hackathon challenge, before writing any code:
1. Restate the core user problem in exactly one sentence
2. Identify the single most impressive AI-powered feature for the demo
3. List the three screens required for a coherent happy-path demo
4. Propose the tech stack (default below, flag if domain warrants a change)
5. Flag any domain risks: medical disclaimers, financial liability, data privacy
Then present this as a structured plan. Wait for my confirmation before coding.

## 🛠️ Tech Stack Defaults

- **Framework:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Components:** Shadcn/ui — default to these for all UI elements
- **Backend/DB:** Supabase (default) — swap to Firebase only if real-time sync is critical
- **Theme Default:** Dark mode — UNLESS domain is Healthcare or Education,
  in which case default to light mode with accessible neutral palette.

## 🧠 Operational Behaviour

1. **Plan First:** Always generate a step-by-step implementation plan before writing
   code. Use Plan Mode in Antigravity. Never skip this at hackathon start.

2. **Artifact Hygiene:** After completing each task, produce a brief artifact summary:
   what was built, what decisions were made, what remains. Judges evaluate
   Artifacts for prompt elegance — keep them legible and intentional.

3. **Demo-First Sequencing:** Always build the happy-path user flow first.
   A broken edge case is invisible in a demo. A broken happy path loses the competition.

4. **Atomic Commits:** Proactively commit working code with meaningful messages.

5. **Silent Installs:** If a package is missing, install via npm without asking.

6. **Error Handling:** If a build error occurs, investigate logs and fix autonomously.
   Only escalate if the error requires a business logic decision from me.

7. **No Placeholders:** Never write "TODO" or "Add logic here." Implement the logic
   or ask me for the specific business rule. Placeholders break live demos.

8. **Seed Over Forms:** Never build a flow that requires live data entry during the demo.
   Pre-seed realistic, domain-appropriate data so the demo flows without typing.

9. **Sequential Reasoning:** For challenge intake, feature architecture, and
   any decision with more than two valid approaches — use sequential_thinking
   to reason through options explicitly. The artifact trail is judged.
   Never collapse ambiguous decisions into silent one-shot choices.

10. **Supabase MCP Protocol:** Before writing any database code, always call
   list_tables and get_table_schema via Supabase MCP to read the live schema.
   Never guess column names. Never use placeholder schema from memory.
   For demo data: seed via execute_sql before declaring a feature done.

## ✅ Code Quality Standards
# Judges score code quality directly — treat this as a judging criterion, not a nice-to-have.
# These rules apply to every file written. No exceptions under time pressure.

### 📖 Readability

- **Meaningful names only:** Variables, functions, and components must describe
  what they do. `getUserEligibility()` not `fn1()`. `isLoading` not `flag`.
- **One responsibility per function:** If a function does two things, split it.
  Maximum 40 lines per function — if longer, extract helper functions.
- **No magic numbers or strings:** Extract all literals to named constants.
  `const MAX_SCHEMES = 5` not `if (results.length > 5)`.
- **Consistent naming conventions:**
  - Components: PascalCase (`EligibilityCard`)
  - Functions/variables: camelCase (`fetchSchemes`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
  - Files: kebab-case (`eligibility-card.tsx`)
- **Comment the WHY, not the WHAT:** Only add comments for non-obvious logic.
  `// Retry on 429 to handle Gemini rate limits` is useful.
  `// Increment counter` above `count++` is not.
- **Consistent formatting:** Use Prettier defaults throughout. No mixed quote
  styles, no inconsistent indentation. Run `npx prettier --write .` before freezing.

### 🔐 Security

- **Zero secrets in source code:** No API keys, tokens, database URLs, or
  credentials hardcoded anywhere. Use `.env.local` for local dev and
  Google Cloud Secret Manager for production — see Security & Secrets section.
- **Input sanitisation on all user inputs:** Sanitise before passing to AI
  prompts, database queries, or API calls. Never interpolate raw user input
  directly into a prompt string.
- **Principle of least privilege:** Service accounts and API tokens should have
  only the permissions they need. Never use admin credentials for runtime calls.
- **No sensitive data in URLs or logs:** Never log API keys, user PII, or
  AI prompt contents. Console.log is fine for debugging flow — not for values.
- **Validate on the server, not just the client:** Client-side validation is UX.
  Server-side validation is security. Always do both.
- **Content Security Policy:** For any app with AI-generated content rendered
  as HTML, sanitise output before rendering. Use `DOMPurify` if rendering HTML.

### 🌍 Environment Validation

- **Validate all env vars at startup — not at call time.**
  Create `src/lib/env.ts` as a single validated env module using `zod`:

  ```typescript
  import { z } from 'zod'

  const envSchema = z.object({
    GEMINI_API_KEY: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  })

  export const env = envSchema.parse(process.env)
  ```

  Import `env` from this file everywhere. Never access `process.env` directly
  in components or route handlers — always go through `src/lib/env.ts`.

- **Fail fast on missing config:** If a required env var is absent, the app
  must throw a clear error at boot — not silently fail or return undefined mid-flow.
- **Maintain `.env.example`:** Every env var used in the app must have a
  documented placeholder in `.env.example`. Keep it in sync as you add vars.
- **Separate client and server env vars:** Prefix browser-safe vars with
  `NEXT_PUBLIC_`. Never expose server-only secrets with that prefix.

### 🚨 Error Handling

- **Never swallow errors silently:**
  ```typescript
  // ❌ BAD — silent failure breaks the demo invisibly
  try { await fetchSchemes() } catch (e) {}

  // ✅ GOOD — log and surface the error appropriately
  try {
    await fetchSchemes()
  } catch (error) {
    console.error('[fetchSchemes] failed:', error)
    throw new Error('Unable to load schemes. Please try again.')
  }
  ```

- **Use typed custom errors for domain logic:**
  ```typescript
  export class EligibilityError extends Error {
    constructor(
      message: string,
      public readonly code: 'NO_MATCH' | 'API_TIMEOUT' | 'INVALID_INPUT'
    ) {
      super(message)
      this.name = 'EligibilityError'
    }
  }
  ```

- **API route error responses must be structured:**
  ```typescript
  // Every API route must return consistent shape on error
  return NextResponse.json(
    { success: false, error: 'Human-readable message', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
  ```

- **All AI calls must have timeouts and retries:**
  Wrap Gemini/Claude API calls with a timeout (default 15s) and one automatic
  retry on transient errors (429, 503). Never let an AI call hang indefinitely
  during a live demo.

- **UI must handle every loading and error state explicitly:**
  Every async operation needs three UI states: loading, success, error.
  Never leave a component stuck in a loading spinner with no escape.
  Use Shadcn `Skeleton` for loading and a visible inline error message for failures.

- **Boundary components:** Wrap each major page section in a React Error Boundary.
  A crash in the AI results panel must not crash the input form.

### 🧩 TypeScript Discipline

- **Strict mode always on:** `tsconfig.json` must include `"strict": true`.
  Never disable it to suppress errors — fix the types instead.
- **No `any` types:** Every variable, parameter, and return value must be
  explicitly typed. Use `unknown` + type narrowing if the shape is uncertain.
- **Define domain types in `src/types/`:** Shared types (e.g. `Scheme`,
  `UserProfile`, `EligibilityResult`) live in a dedicated types file, not
  scattered across components.
- **Type AI responses explicitly:**
  ```typescript
  // Define the schema before calling the AI — never trust raw AI output shape
  const SchemeResult = z.object({
    name: z.string(),
    eligibility: z.string(),
    nextSteps: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  })
  type SchemeResult = z.infer<typeof SchemeResult>
  ```

### 🗂️ Project Structure

Follow this layout. Do not deviate without a documented reason.
**The golden rule: a developer must know exactly which folder to look in
without reading any code. Frontend code never imports from `backend/`.
Backend code never imports from `frontend/`.**

```
src/
  frontend/                  # Everything the browser downloads and renders
    components/              # Reusable UI components (PascalCase filenames)
      ui/                    # Shadcn-generated primitives — do not hand-edit
      [feature]/             # Feature-scoped components, e.g. eligibility/
    app/                     # Next.js App Router — pages, layouts, loading.tsx
    hooks/                   # Custom React hooks (use* naming convention)
    styles/                  # Global CSS, Tailwind config overrides
    utils/                   # Pure client-side helpers (formatting, parsing)

  backend/                   # Everything that runs only on the server
    api/                     # Next.js Route Handlers (route.ts files)
      [feature]/             # One folder per domain, e.g. eligibility/
    services/                # Business logic called by route handlers
      ai/                    # AI prompt construction, response parsing
      db/                    # Database query functions (no raw SQL in routes)
    lib/                     # Server-only singletons and clients
      env.ts                 # Validated env vars — single source of truth
      secrets.ts             # Secret Manager fetch utility
      supabase.ts            # Supabase server client
      gemini.ts              # AI client with retry/timeout wrapper

  shared/                    # Safe to import from both frontend and backend
    types/                   # TypeScript interfaces and Zod schemas
    constants/               # App-wide constants (MAX_SCHEMES, SCHEME_TYPES)
    validators/              # Zod schemas used for both form and API validation
```

**Enforcement rules agents must follow:**

- **Never import server code into client components.** If a file in `frontend/`
  imports from `backend/`, that is a hard violation — it leaks secrets and
  breaks the Next.js server/client boundary.
- **Route handlers are thin.** `backend/api/` files should only: validate
  input → call a service → return a response. All logic lives in `backend/services/`.
- **Shared types are the contract.** Define request/response types in
  `shared/types/` and import them in both the frontend fetch call and the
  backend route handler. Never duplicate type definitions.
- **Feature folders mirror across layers.** If you create
  `backend/services/eligibility/`, the matching UI lives in
  `frontend/components/eligibility/`. Parallel naming makes the codebase
  navigable under time pressure.
- **No barrel files** (`index.ts` re-exports) unless the directory has 5+
  exports. They obscure import origins and slow down tree-shaking.
- **Co-locate tests:** Place `*.test.ts` files next to the files they test,
  not in a separate top-level `__tests__` folder.

### ⚡ Performance Basics

- **No N+1 queries:** Never call the database inside a loop. Batch queries
  using `in` clauses or Supabase's `select` with filters.
- **Cache AI responses for identical inputs:** Within a session, if the same
  user profile is submitted twice, return the cached result — don't re-call the AI.
  Use a simple `Map` or `useRef` cache. This prevents demo slowdowns.
- **Lazy load heavy components:** Use `next/dynamic` for components that are
  not on the critical render path (charts, maps, modals).
- **Loading states prevent layout shift:** Always reserve space for loading
  content using `Skeleton` components — never let the layout jump when data loads.

### 🔬 Pre-Demo Checklist
Run through this at feature freeze (T-45min) before rehearsing:

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npx prettier --check .` — zero formatting violations
- [ ] `npx eslint . --max-warnings 0` — zero lint warnings
- [ ] All env vars documented in `.env.example`
- [ ] No `console.error` or uncaught promise rejections in browser console
- [ ] Every loading state shows a spinner or skeleton — no blank screens
- [ ] Every error state shows a user-friendly message — no raw error objects
- [ ] No hardcoded secrets or `process.env` accessed outside `src/lib/env.ts`

## 🎨 Design & UX DNA

- **Theme:** Dark mode by default. Light mode for Healthcare/Education (see stack above).
- **Dark Palette:** Deep grays (#0a0a0a), vibrant accents (Electric Blue or Purple),
  subtle glassmorphism on card surfaces only — never on primary text containers.
- **Light Palette:** Whites and soft grays, teal or indigo accents, clean sans-serif.
- **Spacing:** Generous whitespace. Everything should feel breathable.
- **Feedback:** All interactive elements must have hover states and loading transitions.
- **Animated Feedback:** At least one key interaction must have a meaningful animation
  that shows the AI working — streaming text, a progress arc, a live-updating value.

## 🚀 Speed Hacks

- **Parallel Agents from T=0:** Launch UI agent and backend/data agent simultaneously
  in Manager View. Never run them sequentially — this is your primary time advantage.
- **JIT Components:** Create small, reusable components in @/components/ui.
- **Dry Run:** Before declaring a feature done, run the dev server and verify in browser.
- **Feature Freeze at T-45min:** Stop building. Polish only. Rehearse demo. No new features.

## 🔐 Security & Secrets

# Secrets never touch source code or version control. No exceptions.

- **Source of Truth:** Google Cloud Secret Manager for ALL sensitive values —
  API keys, database URLs, third-party tokens, anything non-public.

- **Code Pattern:** Use the @google-cloud/secret-manager SDK.
  Create src/lib/secrets.ts as the single fetch utility:

  import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
  const client = new SecretManagerServiceClient()
  export async function getSecret(name: string): Promise<string> {
    const [v] = await client.accessSecretVersion({ name })
    return v.payload?.data?.toString() ?? ''
  }
  Call this at server startup or in API route handlers — never in client components.

- **Cloud Run Wiring:** In deploy.sh, pass secrets via --set-secrets, not --set-env-vars.
  Example: --set-secrets="OPENAI_KEY=openai-api-key:latest"
  This binds the Secret Manager version ARN — the raw value never appears in the command.

- **IAM / Access Control:** The Cloud Run service account must have
  roles/secretmanager.secretAccessor. Add this grant to setup.sh:
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

- **Local Dev:** Use .env.local for local testing only. It must exist in .gitignore.
  Verify .gitignore contains .env.local before the first commit — do not assume it is there.

- **NEVER:** hardcode secrets in source files, commit any .env* file (except .env.example),
  pass raw secret values via --set-env-vars in Cloud Run, or log secret values in any output.

## 🎤 Demo Narrative Anchor

# Every agent knows what story we're telling. Build toward this.
The demo must visibly answer three questions — shown in the UI, not just stated:
1. What problem does this solve? (user pain point must be obvious from screen 1)
2. Where is the AI doing real work? (must be a visible, animated moment)
3. Why is this better than without AI? (the contrast must be demonstrable)

## 🔁 Failure Recovery Protocol

If a feature is broken at T-60min and unresolved after one retry:
- Disable the broken route. Add a clear "Coming soon" placeholder — never a crash.
- Redirect the demo flow to working features only.
- Never demo a broken state to judges. A graceful gap beats a visible error.
- Prioritise: core happy path working > extra features working > polish.

## ☁️ Deployment (run after feature freeze)

- **Target Platform:** Google Cloud Run
- **Target GCP Credentials:** Use the credentials stored in ~/.config/gcloud/application_default_credentials.json
- **Target GCP Project:** promptwars-pnq01.
- **Target GCP Region:** asia-south1 (Mumbai) or asia-south2 (Kolkata) to minimise latency for Indian demo environments.
- **Port:** Always use PORT env variable, default 8080. Never hardcode 3000.
- **Containerisation:** Multi-stage Docker build for optimised image size.
- **Health Check:** Web server must respond to / or /health immediately on startup.
- **Env Vars:** Maintain .env.example with placeholder values only — never real secrets.
- **Deployment Script:** Maintain deploy.sh using gcloud run deploy --source . --allow-unauthenticated
- **API Provisioning:** Generate setup.sh to enable Cloud Run, Artifact Registry,
- **Secret Manager:** Enable via gcloud services enable. Include IAM grant for secretAccessor.

## 🛑 The "Reviewer" Protocol (Overrides all else)
1. **No Silent Execution:** Even if a task seems trivial, you must present the 
   Implementation Plan. 
2. **Terminal Restraint:** Do not run `npm install` or `gcloud` commands without 
   displaying the command in the chat and waiting for my "Go" or "Approved".
3. **Plan Checkpoints:** For any task spanning more than 2 files, stop after 
   the Plan Artifact is generated. Do not proceed to the "Execute" phase 
   until I provide feedback.

## ⚡ Hackathon Secret Bypass
- **Local First:** During the 2-hour build, prioritize `.env.local` for speed.
- **Validation:** Use the `src/lib/env.ts` Zod schema to ensure the app fails 
  instantly if a key is missing, rather than debugging a silent "undefined" 
  during the demo.
  
# Deployment is polish — get a working local demo first. Deploy only if time permits.