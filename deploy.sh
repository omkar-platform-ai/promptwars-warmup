#!/bin/bash
set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"
SERVICE_NAME="vidyaai"
IMAGE="asia-south1-docker.pkg.dev/${PROJECT_ID}/${SERVICE_NAME}/app:latest"

echo "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories create vidyaai --repository-format=docker --location=$REGION --description="Docker repository" || true

# Read NEXT_PUBLIC_ vars from .env.local — these must be baked into the
# Next.js client bundle at build time, so we copy them into a temp env file
# that is added to the Docker build context.
RUNTIME_ENV_VARS=""
if [ -f .env.local ]; then
  echo "Generating .env.production from .env.local for Docker build context..."
  # Write a .env.production that the Dockerfile will COPY in
  grep '^NEXT_PUBLIC_' .env.local > .env.production

  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    value="${value%\"}"
    value="${value#\"}"
    if [[ "$key" == NEXT_PUBLIC_* ]]; then
      RUNTIME_ENV_VARS="${RUNTIME_ENV_VARS}${key}=${value},"
    fi
  done < .env.local
  RUNTIME_ENV_VARS="${RUNTIME_ENV_VARS%,}"
fi

echo "Building Docker image and pushing to Artifact Registry..."
gcloud builds submit --tag "$IMAGE"

# Clean up temp file
rm -f .env.production

echo "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE" \
    --region "$REGION" \
    --port 8080 \
    --min-instances 1 \
    --max-instances 10 \
    --memory 512Mi \
    ${RUNTIME_ENV_VARS:+--set-env-vars="$RUNTIME_ENV_VARS"} \
    --set-secrets="FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,GOOGLE_CLOUD_PROJECT=GOOGLE_CLOUD_PROJECT:latest,VERTEX_AI_LOCATION=VERTEX_AI_LOCATION:latest" \
    --allow-unauthenticated

echo "Deployment finished. Public URL:"
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.url)'
