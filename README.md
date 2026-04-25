# VidyaAI — Adaptive Learning Platform

**Learn anything. At your pace. Powered by Gemini.**

VidyaAI is an AI-powered adaptive learning platform that generates personalized explanations, quizzes, and tracks mastery — adjusting difficulty in real time based on student performance.

## ✨ Features

- **AI-Generated Explanations** — Enter any topic. Get a concise, beginner-friendly explanation with real-world Indian analogies (Level 1). Fail the quiz? Get a deeper, step-by-step re-explanation (Level 2).
- **Adaptive Quiz Engine** — Auto-generated MCQs that test understanding, not memorisation. Score ≥ 50% → success. Score < 50% → automatic level-up with deeper content.
- **Dramatic Level Transitions** — Full-screen overlays with Framer Motion animations when transitioning between levels.
- **Mastery Tracking** — Firestore-backed progress persistence per user.
- **Semantic Topic Suggestions** — Embedding-based related topic recommendations (via `text-embedding-005`).
- **Google Sign-In** — Firebase Authentication with Google provider.

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.tsx                 # Home — sign-in + recent topics
│   ├── learn/page.tsx           # Core learning flow
│   ├── mastery/page.tsx         # Mastery dashboard
│   └── api/
│       ├── explain/route.ts     # Gemini 2.5 Flash → topic explanation
│       ├── quiz/route.ts        # Gemini 2.5 Flash → MCQ generation (JSON mode)
│       ├── mastery/route.ts     # Firestore mastery write
│       └── embed/route.ts       # text-embedding-005 → related topics
├── hooks/
│   └── useAdaptiveLearning.ts   # State machine: explain → quiz → score → adapt
├── frontend/lib/
│   └── firebase-client.ts       # Client-side Firebase (Auth + Firestore)
├── backend/lib/
│   ├── firebase-admin.ts        # Server-side Firebase Admin SDK
│   └── env.ts                   # Zod-validated env config
└── shared/
    └── types.ts                 # Shared TypeScript contracts
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router, Turbopack) |
| AI | Google Gemini 2.5 Flash via `@google/genai` (Vertex AI backend) |
| Embeddings | `text-embedding-005` via Vertex AI |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Styling | Tailwind CSS + inline styles, Framer Motion |
| Deployment | Cloud Run (containerised, standalone output) |
| Deployment(Security) | Google Secrets Manager (credentials) |
| Deployment | Artifact Registry (docker images) |

## 📋 Prerequisites

- **Node.js** 20+
- **npm** 9+
- **Google Cloud CLI** (`gcloud`) authenticated
- A GCP project with **Vertex AI API** enabled
- A Firebase project with **Authentication** and **Firestore** enabled

## 🚀 Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd promptwars-warmup
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=000000000000
NEXT_PUBLIC_FIREBASE_APP_ID=1:000000000000:web:0000000000000000

# Firebase Admin (server-side only)
NEXT_FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
NEXT_FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Set up GCP credentials

```bash
# Authenticate with Google Cloud (for Vertex AI)
gcloud auth application-default login
gcloud config set project <your-vertex-ai-project>
```

### 4. Configure Firestore Security Rules

In the Firebase Console → Firestore → Rules, publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/mastery/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /mastery/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🌐 Deployment (Cloud Run)

```bash
# Build & deploy
chmod +x deploy.sh
./deploy.sh
```

The deploy script:
1. Builds a Docker image (multi-stage, standalone Next.js output)
2. Pushes to Artifact Registry
3. Deploys to Cloud Run with secrets from Secret Manager

### Required Cloud Run environment

| Variable | Source |
|----------|--------|
| `FIREBASE_CLIENT_EMAIL` | Secret Manager |
| `FIREBASE_PRIVATE_KEY` | Secret Manager |
| `NEXT_PUBLIC_FIREBASE_*` | `--set-env-vars` |
| `VERTEX_AI_PROJECT` | `--set-env-vars` (defaults to `promptwars-pnq01`) |

## 🧪 Testing

See [TESTING.md](./TESTING.md) for manual test evidence and security verification.

## 📝 Key Design Decisions

1. **Two GCP projects** — Firebase (auth/db) runs on the Firebase project; Vertex AI runs on a separate GCP project with the API enabled. The `VERTEX_AI_PROJECT` env var bridges this.
2. **`@google/genai` over `@google-cloud/vertexai`** — The newer SDK with `vertexai: true` flag. Cleaner API, thinking budget control, structured JSON output via `responseMimeType`.
3. **Quiz uses `thinkingBudget: 0`** — Disables Gemini 2.5 Flash's reasoning mode for quiz generation, reducing latency from 30s+ to ~2s.
4. **Mastery is fire-and-forget** — The Firestore write happens async so a DB failure never blocks the demo flow.
5. **System font stack** — No Google Font downloads. Eliminates network-dependent startup lag.

## 📄 License

Built for PromptWars Hackathon — Pune 2026.
