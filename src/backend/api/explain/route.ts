import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { env } from '../../../lib/env';
import { auth } from '../../../lib/firebase-admin';

// Initialize Vertex AI
const vertexAi = new VertexAI({
  project: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  location: env.VERTEX_AI_LOCATION || 'us-central1',
});

// Initialize Gemini Model
const geminiModel = vertexAi.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
});

// Helper for auth validation
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

// 15s timeout wrapper
async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Vertex AI Timeout')), 15000)
  );
  return Promise.race([promise, timeout]);
}

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, level } = await req.json();
    if (!topic || !level) {
      return NextResponse.json({ error: 'Missing topic or level' }, { status: 400 });
    }

    let prompt = '';
    if (level === 1) {
      prompt = `Explain ${topic} to a first-year college student in India. \nUse one real-life Indian analogy. Maximum 150 words. No jargon. \nEnd with one sentence summarising the key idea.`;
    } else if (level === 2) {
      prompt = `The student answered the comprehension questions incorrectly.\nRe-explain ${topic} with: (1) a step-by-step breakdown, (2) one \nconcrete example with numbers or code if applicable, (3) common \nmisconception addressed. Maximum 250 words.`;
    } else {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 });
    }

    const response = await withTimeout(geminiModel.generateContent(prompt));
    const content = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ topic, level: level === 1 ? 'L1' : 'L2', content });
  } catch (error: any) {
    console.error('Explain API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
