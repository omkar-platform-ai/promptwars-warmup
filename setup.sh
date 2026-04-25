#!/bin/bash

# Enable required GCP APIs
echo "Enabling GCP APIs..."
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    aiplatform.googleapis.com

# Get the current project number to grant roles to the default compute service account
PROJECT_ID=$(gcloud config get-value project)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant roles
echo "Granting roles to compute service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/datastore.user"

# Create secrets in Secret Manager
echo "Creating secrets..."
gcloud secrets create FIREBASE_CLIENT_EMAIL --replication-policy="automatic" || true
gcloud secrets create FIREBASE_PRIVATE_KEY --replication-policy="automatic" || true
gcloud secrets create GOOGLE_CLOUD_PROJECT --replication-policy="automatic" || true
gcloud secrets create VERTEX_AI_LOCATION --replication-policy="automatic" || true

echo "Setup complete. Please remember to add new versions to the created secrets with the actual values."
