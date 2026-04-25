#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)
REGION="asia-south1"
SERVICE_NAME="vidyaai"
IMAGE="asia-south1-docker.pkg.dev/${PROJECT_ID}/${SERVICE_NAME}/app:latest"

echo "Building Docker image and pushing to Artifact Registry..."
# Note: Requires an Artifact Registry repository named 'vidyaai' to exist in 'asia-south1'
# If it doesn't exist, you can create it with:
# gcloud artifacts repositories create vidyaai --repository-format=docker --location=asia-south1
gcloud builds submit --tag $IMAGE

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE \
    --region $REGION \
    --port 8080 \
    --min-instances 1 \
    --max-instances 10 \
    --memory 512Mi \
    --set-secrets="FIREBASE_CONFIG=FIREBASE_CONFIG:latest,GOOGLE_CLOUD_PROJECT=GOOGLE_CLOUD_PROJECT:latest,VERTEX_AI_LOCATION=VERTEX_AI_LOCATION:latest" \
    --allow-unauthenticated

echo "Deployment finished. Public URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'
