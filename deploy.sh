#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"
SERVICE_NAME="vidyaai"
IMAGE="asia-south1-docker.pkg.dev/${PROJECT_ID}/${SERVICE_NAME}/app:latest"

echo "Ensuring Artifact Registry repository exists..."
gcloud artifacts repositories create vidyaai --repository-format=docker --location=$REGION --description="Docker repository" || true

echo "Building Docker image and pushing to Artifact Registry..."
gcloud builds submit --tag $IMAGE

# Source frontend env vars from .env.local if it exists
ENV_VARS=""
if [ -f .env.local ]; then
  echo "Loading env vars from .env.local..."
  # Extract NEXT_PUBLIC_ variables and format as KEY=VALUE,KEY2=VALUE2
  ENV_VARS=$(grep '^NEXT_PUBLIC_' .env.local | tr '\n' ',' | sed 's/,$//')
fi

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE \
    --region $REGION \
    --port 8080 \
    --min-instances 1 \
    --max-instances 10 \
    --memory 512Mi \
    ${ENV_VARS:+--set-env-vars="$ENV_VARS"} \
    --set-secrets="FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,GOOGLE_CLOUD_PROJECT=GOOGLE_CLOUD_PROJECT:latest,VERTEX_AI_LOCATION=VERTEX_AI_LOCATION:latest" \
    --allow-unauthenticated

echo "Deployment finished. Public URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
