'use client';

import { useEffect } from 'react';

// Initialises Firebase Analytics on first mount.
// Must be a separate 'use client' component so layout.tsx can remain a
// Server Component (required for `export const metadata`).
export function AnalyticsInit() {
  useEffect(() => {
    import('@/frontend/lib/firebase-client').then(({ app, isMock }) => {
      if (isMock || !app) return;
      import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
        isSupported().then((ok) => { if (ok) getAnalytics(app); });
      });
    });
  }, []);
  return null;
}
