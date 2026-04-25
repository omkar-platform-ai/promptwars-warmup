'use client';

// Thin wrapper so any client component can fire analytics events without
// worrying about SSR or mock-mode guards.
export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  try {
    const { app, isMock } = await import('./firebase-client');
    if (isMock || !app) return;
    const { getAnalytics, logEvent, isSupported } = await import('firebase/analytics');
    if (await isSupported()) {
      logEvent(getAnalytics(app), name, params);
    }
  } catch {
    // Analytics is best-effort — never let it break the demo flow
  }
}
