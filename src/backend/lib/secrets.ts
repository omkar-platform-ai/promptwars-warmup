import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();

export async function getSecret(name: string): Promise<string> {
  // If we are in local development, we fallback to process.env
  // But strictly, we should still fetch if possible. For PromptWars,
  // we prioritize process.env locally for speed.
  if (process.env.NODE_ENV === 'development' && process.env[name]) {
    return process.env[name] as string;
  }

  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error(`Cannot fetch secret ${name}: Project ID is undefined`);
    }
    
    // Create the full secret name
    const secretName = `projects/${projectId}/secrets/${name}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name: secretName });
    return version.payload?.data?.toString() ?? '';
  } catch (error) {
    console.error(`[getSecret] failed to fetch ${name}:`, error);
    // Fallback to process.env if available, just in case
    if (process.env[name]) return process.env[name] as string;
    throw new Error(`Secret ${name} not found and not in process.env`);
  }
}
