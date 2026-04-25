import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import { env } from '../../../lib/env';
import { auth } from '../../../lib/firebase-admin';

const vertexAi = new VertexAI({
  project: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  location: env.VERTEX_AI_LOCATION || 'us-central1',
});

const embedModel = vertexAi.getGenerativeModel({
  model: 'text-embedding-004',
});

const SEED_TOPICS = [
  'recursion', 'arrays', 'sorting', 'OOP', 'SQL', 'linked lists', 
  'trees', 'graphs', 'OS', 'networking', 'photosynthesis', 'thermodynamics', 
  'calculus', 'economics', 'history', 'geography', 'chemistry', 'physics', 
  'probability', 'statistics'
];

let seedEmbeddingsCache: { topic: string, vector: number[] }[] = [];

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

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await withTimeout(embedModel.embedContent(text));
  // Adjust depending on actual response shape from SDK.
  // Generally @google-cloud/vertexai embedContent returns something like:
  return response.embeddings?.[0]?.values || response.embedding?.values || [];
}

export async function POST(req: Request) {
  try {
    const decodedToken = await verifyAuth(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    // Populate cache on first request
    if (seedEmbeddingsCache.length === 0) {
      const embeds = await Promise.all(SEED_TOPICS.map(t => getEmbedding(t)));
      seedEmbeddingsCache = SEED_TOPICS.map((t, i) => ({
        topic: t,
        vector: embeds[i]
      }));
    }

    const topicVector = await getEmbedding(topic);
    if (!topicVector || topicVector.length === 0) {
      throw new Error('Failed to generate embedding');
    }

    // Compare and sort
    const similarities = seedEmbeddingsCache.map(seed => ({
      topic: seed.topic,
      score: cosineSimilarity(topicVector, seed.vector)
    }));

    similarities.sort((a, b) => b.score - a.score);
    const top2 = [similarities[0].topic, similarities[1].topic];

    return NextResponse.json({ related: top2 });
  } catch (error: any) {
    console.error('Embed API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
