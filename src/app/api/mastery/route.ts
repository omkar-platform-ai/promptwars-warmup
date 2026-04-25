import { NextResponse } from 'next/server';
import { db, auth } from '@/backend/lib/firebase-admin';

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

    const { topicName, levelReached, masteryScore } = await req.json();

    if (!topicName || !levelReached || masteryScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = decodedToken.uid;

    // Write to Firestore collection: users/{userId}/mastery/{topicName}
    const masteryRef = db.collection('users').doc(userId).collection('mastery').doc(topicName);

    await masteryRef.set({
      topicName,
      levelReached,
      masteryScore,
      timestamp: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, topicName, levelReached, masteryScore });
  } catch (error: any) {
    console.error('Mastery API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
