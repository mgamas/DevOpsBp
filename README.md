
# DevOpsBP - Node.js Application Deployment on GKE

This repository contains the configuration and scripts necessary to deploy a Node.js application on Google Kubernetes Engine (GKE) using Terraform and GitHub Actions.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Terraform](https://www.terraform.io/downloads.html)
- [Docker](https://www.docker.com/products/docker-desktop)
- [GitHub Actions](https://docs.github.com/en/actions)

## Project Structure

```plaintext
.
├── .github
│   └── workflows
│       └── ci-cd-pipeline.yml
├── Dockerfile
├── configmap.yaml
├── deployment.yaml
├── ingress.yaml
├── secret.yaml
├── service.yaml
├── main.tf
├── variables.tf
├── outputs.tf
└── terraform.tfvars
```

## Step-by-Step Guide

### Step 1: Set Up Google Cloud SDK

1. Install Google Cloud SDK: [Installation Guide](https://cloud.google.com/sdk/docs/install)
2. Authenticate with your Google account:
    ```sh
    gcloud auth login
    gcloud config set project YOUR_PROJECT_ID
    ```

### Step 2: Install Terraform

1. Download and install Terraform: [Download Terraform](https://www.terraform.io/downloads.html)
2. Verify the installation:
    ```sh
    terraform -v
    ```

### Step 3: Create Docker Image

1. Build Docker image:
    ```sh
    docker build -t gcr.io/YOUR_PROJECT_ID/demo-devops-nodejs:latest .
    ```
2. Push Docker image to Google Container Registry (GCR):
    ```sh
    docker push gcr.io/YOUR_PROJECT_ID/demo-devops-nodejs:latest
    ```

### Step 4: Set Up Terraform Configuration

1. Create Terraform configuration files as follows:

`main.tf`:
```hcl
provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_container_cluster" "primary" {
  name     = "my-gke-cluster"
  location = var.region

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  initial_node_count = 3
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "my-node-pool"
  cluster    = google_container_cluster.primary.name
  location   = google_container_cluster.primary.location
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }
}

resource "google_container_node_pool" "secondary_nodes" {
  name       = "my-secondary-node-pool"
  cluster    = google_container_cluster.primary.name
  location   = google_container_cluster.primary.location
  node_count = 2

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }
}

output "kubernetes_cluster_name" {
  value = google_container_cluster.primary.name
}

output "region" {
  value = var.region
}

output "project_id" {
  value = var.project_id
}
```

`variables.tf`:
```hcl
variable "project_id" {
  description = "The ID of the project in which to create the cluster"
  type        = string
}

variable "region" {
  description = "The region in which to create the cluster"
  type        = string
  default     = "us-central1"
}
```

`outputs.tf`:
```hcl
output "kubernetes_cluster_name" {
  value = google_container_cluster.primary.name
}

output "region" {
  value = var.region
}

output "project_id" {
  value = var.project_id
}
```

`terraform.tfvars`:
```hcl
project_id = "YOUR_PROJECT_ID"
region     = "us-central1"
```

2. Initialize and apply Terraform:
    ```sh
    terraform init
    terraform apply
    ```

### Step 5: Configure Kubernetes Manifests

- Ensure your Kubernetes manifests are correctly configured to use the Docker image from GCR.

Example:

`deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
    spec:
      containers:
      - name: demo-container
        image: gcr.io/YOUR_PROJECT_ID/demo-devops-nodejs:latest
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: demo-config
        - secretRef:
            name: demo-secret
```

### Step 6: Set Up GitHub Actions

1. Create the GitHub Actions workflow file `.github/workflows/ci-cd-pipeline.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main

permissions:
  contents: read
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm test

    - name: Static Code Analysis
      run: npm run lint

    - name: Code Coverage
      run: npm run coverage

    - name: Build Docker image
      run: docker build -t gcr.io/${{ secrets.GOOGLE_PROJECT_ID }}/demo-devops-nodejs:latest .

    - name: Push Docker image to GCR
      run: |
        echo ${{ secrets.GOOGLE_PROJECT_SA_KEY }} | docker login -u _json_key --password-stdin https://gcr.io
        docker push gcr.io/${{ secrets.GOOGLE_PROJECT_ID }}/demo-devops-nodejs:latest

    - name: Set up Google Cloud SDK
      uses: google-github-actions/setup-gcloud@v2
      with:
        service_account_key: ${{ secrets.GOOGLE_PROJECT_SA_KEY }}
        project_id: ${{ secrets.GOOGLE_PROJECT_ID }}
        export_default_credentials: true

    - name: Get GKE credentials
      uses: google-github-actions/get-gke-credentials@v2
      with:
        cluster_name: my-gke-cluster
        location: us-central1

    - name: Deploy ConfigMap to Kubernetes
      run: kubectl apply -f configmap.yaml

    - name: Deploy Secret to Kubernetes
      run: kubectl apply -f secret.yaml

    - name: Deploy Deployment to Kubernetes
      run: kubectl apply -f deployment.yaml

    - name: Deploy Service to Kubernetes
      run: kubectl apply -f service.yaml

    - name: Deploy Ingress to Kubernetes
      run: kubectl apply -f ingress.yaml
```

### Step 7: Verify Deployment

1. **Check the status of the pods**:
    ```sh
    kubectl get pods
    ```

2. **Access the application**:
    - If you configured Ingress and mapped your domain in the `/etc/hosts` file, you can access the application using the configured domain.

### Conclusion

Following these steps will help you set up a CI/CD pipeline using GitHub Actions to deploy your Node.js application on Google Kubernetes Engine. The pipeline builds the Docker image, pushes it to Google Container Registry, and deploys the application to GKE.

Feel free to contribute and open issues if you encounter any problems!
