import { NextResponse } from 'next/server';
import { db, auth } from '../../../lib/firebase-admin';

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    return await auth.verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, topic, level, score, timestamp, attempts } = await req.json();

    if (!userId || !topic || level === undefined || score === undefined || !timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Write to Firestore collection: users/{userId}/mastery/{topic}
    const masteryRef = db.collection('users').doc(userId).collection('mastery').doc(topic);

    await masteryRef.set({
      topic,
      level,
      score,
      timestamp,
      attempts: attempts || 1
    }, { merge: true });

    return NextResponse.json({ success: true, topic, level, score });
  } catch (error: any) {
    console.error('Mastery API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
