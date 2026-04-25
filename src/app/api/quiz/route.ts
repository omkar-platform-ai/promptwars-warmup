import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/backend/lib/firebase-admin';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.VERTEX_AI_PROJECT || 'promptwars-pnq01',
  location: 'us-central1',
});

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

    const prompt = `Topic: "${topic}". Generate exactly 2 MCQs testing understanding. 4 options each, 1 correct. Return ONLY a JSON array: [{"question":"...","options":["a","b","c","d"],"correct":"a"}]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for speed
        },
      },
    });

    const text = response.text || '[]';
    const cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let quizData;
    try {
      quizData = JSON.parse(cleanText);
    } catch {
      const match = cleanText.match(/\[[\s\S]*\]/);
      quizData = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json(quizData);
  } catch (error: any) {
    console.error('Quiz API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
