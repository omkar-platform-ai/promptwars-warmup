import * as admin from 'firebase-admin';

// Lazy singleton — deferred until first request so build-time mock env vars
// don't cause firebase-admin to crash parsing a fake PEM key.
function getAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!;

  const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? '';
  // .env files store escaped \n; Secret Manager may store actual newlines
  const privateKey = rawKey.replace(/\\n/g, '\n');

  if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL) {
    console.error('Firebase Admin: Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY');
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

// Named accessors — call getAdminApp() on demand, not at import time
export function getDb(): admin.firestore.Firestore {
  return admin.firestore(getAdminApp());
}

export function getAuth(): admin.auth.Auth {
  return admin.auth(getAdminApp());
}

// Keep legacy named exports for callers that use `import { db, auth }`
// (these are proxies so they still resolve lazily)
export const db: admin.firestore.Firestore = new Proxy({} as admin.firestore.Firestore, {
  get(_t, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const auth: admin.auth.Auth = new Proxy({} as admin.auth.Auth, {
  get(_t, prop) {
    return (getAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
