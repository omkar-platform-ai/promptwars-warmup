import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/backend/lib/firebase-admin';

// Use the new Google GenAI SDK with Vertex AI backend
const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.VERTEX_AI_PROJECT || 'promptwars-pnq01',
  location: 'us-central1',
});

// Helper for auth validation
async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split('Bearer ')[1];
  try {
    return await auth.verifyIdToken(token);
  } catch {
    return null;
  }
}

// 15s timeout wrapper
async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('AI Timeout')), 30000)
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

    const response = await withTimeout(
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      })
    );
    const content = response.text || '';

    return NextResponse.json({ topic, level: level === 1 ? 'L1' : 'L2', content });
  } catch (error: any) {
    console.error('Explain API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
