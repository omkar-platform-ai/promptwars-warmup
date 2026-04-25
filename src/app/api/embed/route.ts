import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@/backend/lib/firebase-admin';

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.VERTEX_AI_PROJECT || 'promptwars-pnq01',
  location: 'us-central1',
});

const SEED_TOPICS = [
  'recursion', 'arrays', 'sorting', 'OOP', 'SQL', 'linked lists', 
  'trees', 'graphs', 'OS', 'networking', 'photosynthesis', 'thermodynamics', 
  'calculus', 'economics', 'history', 'geography', 'chemistry', 'physics', 
  'probability', 'statistics'
];

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

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

const embeddingCache = new Map<string, number[]>();

async function getEmbedding(text: string): Promise<number[]> {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }
  const response = await ai.models.embedContent({
    model: 'text-embedding-005',
    contents: text,
  });
  const embedding = response.embeddings?.[0]?.values || [];
  if (embedding.length > 0) {
    embeddingCache.set(text, embedding);
  }
  return embedding;
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

    // Ensure all seed topics are cached and retrieve them
    const embeds = await Promise.all(SEED_TOPICS.map(t => getEmbedding(t)));
    const seedEmbeddingsCache = SEED_TOPICS.map((t, i) => ({
      topic: t,
      vector: embeds[i]
    }));

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
