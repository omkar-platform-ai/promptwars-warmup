# Stage 1: builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# NEXT_PUBLIC_ vars must be present at build time — Next.js inlines them
# into the client JS bundle. These are public Firebase config, not secrets.
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwars-warmup-b71ce.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwars-warmup-b71ce
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwars-warmup-b71ce.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=492351344086
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:492351344086:web:42361e675cb6910cd92877

# Server-only secrets — placeholders for build, real values from Secret Manager at runtime
ENV FIREBASE_CLIENT_EMAIL=build-placeholder
ENV FIREBASE_PRIVATE_KEY=build-placeholder

RUN npm run build

# Stage 2: runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080

CMD ["node", "server.js"]
