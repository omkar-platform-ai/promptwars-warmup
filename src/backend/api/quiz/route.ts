import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { env } from '../../../lib/env';
import { auth } from '../../../lib/firebase-admin';
import { QuizResponseSchema } from '../../../../shared/types';

const vertexAi = new VertexAI({
  project: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  location: env.VERTEX_AI_LOCATION || 'us-central1',
});

const geminiModel = vertexAi.getGenerativeModel({
  model: 'gemini-2.0-flash-001',
});

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

    const { explanation } = await req.json();
    if (!explanation) {
      return NextResponse.json({ error: 'Missing explanation' }, { status: 400 });
    }

    const prompt = `Based on this explanation: ${explanation}\nGenerate exactly 2 multiple choice questions that test \nunderstanding, not memorisation. Each question: 4 options, \nexactly 1 correct answer. Return ONLY a JSON array, no markdown, \nno preamble:\n[{question, options: [a,b,c,d], correct: 'a'|'b'|'c'|'d'}]`;

    const getQuiz = async () => {
      const response = await withTimeout(geminiModel.generateContent(prompt));
      const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      // Strip markdown wrapping if Gemini includes it
      const cleanText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      return JSON.parse(cleanText);
    };

    let quizData;
    try {
      quizData = await getQuiz();
    } catch (err: any) {
      if (err.message === 'Vertex AI Timeout') throw err;
      // retry once on parse failure
      quizData = await getQuiz();
    }

    return NextResponse.json(quizData);
  } catch (error: any) {
    console.error('Quiz API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
