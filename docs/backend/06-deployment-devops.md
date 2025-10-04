# Deployment & DevOps Documentation

## Overview

This document outlines the complete deployment strategy, CI/CD pipelines, infrastructure as code, and DevOps best practices for the Expense-Wise application.

## Table of Contents

1. [Infrastructure Architecture](#1-infrastructure-architecture)
2. [Docker Containerization](#2-docker-containerization)
3. [Kubernetes Orchestration](#3-kubernetes-orchestration)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Infrastructure as Code](#5-infrastructure-as-code)
6. [Environment Configuration](#6-environment-configuration)
7. [Monitoring & Alerting](#7-monitoring--alerting)
8. [Backup & Disaster Recovery](#8-backup--disaster-recovery)

---

## 1. Infrastructure Architecture

### 1.1 Production Environment

```
┌─────────────────────────────────────────────────────┐
│              CloudFlare CDN (Edge)                  │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              AWS Application Load Balancer          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│           Kubernetes Cluster (EKS)                  │
│  ┌───────────────┐  ┌───────────────┐              │
│  │  Frontend     │  │   API Gateway │              │
│  │  (Next.js)    │  │   (Kong)      │              │
│  │  3 replicas   │  │   2 replicas  │              │
│  └───────────────┘  └───────┬───────┘              │
│                              │                       │
│  ┌───────────────┬──────────▼───────┬────────────┐ │
│  │  Auth Service │ Expense Service  │  ...       │ │
│  │  2 replicas   │  3 replicas      │            │ │
│  └───────────────┴──────────────────┴────────────┘ │
│                              │                       │
│  ┌───────────────────────────▼─────────────────┐   │
│  │          Worker Pods                        │   │
│  │  ┌─────────────┐  ┌──────────────┐         │   │
│  │  │ OCR Worker  │  │ Email Worker │         │   │
│  │  │ 2 replicas  │  │ 2 replicas   │         │   │
│  │  └─────────────┘  └──────────────┘         │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼──────┐           ┌────────▼────────┐
│ RDS PostgreSQL│          │  ElastiCache    │
│ Multi-AZ      │          │  Redis Cluster  │
│ Read Replicas │          │  3 nodes        │
└───────────────┘          └─────────────────┘
        │
┌───────▼──────┐           ┌─────────────────┐
│   S3 Bucket  │           │   RabbitMQ      │
│   Receipts   │           │   (AmazonMQ)    │
└──────────────┘           └─────────────────┘
```

### 1.2 Availability Zones

- **Primary Region**: us-east-1 (N. Virginia)
- **DR Region**: us-west-2 (Oregon)
- **Multi-AZ**: Enabled for database and Redis
- **Availability**: 99.9% uptime SLA

---

## 2. Docker Containerization

### 2.1 Base Dockerfile (Next.js Frontend)

```dockerfile
# /Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2.2 Backend Service Dockerfile (Express)

```dockerfile
# /backend/Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodeapp

# Copy dependencies and built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

USER nodeapp

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### 2.3 Worker Service Dockerfile

```dockerfile
# /workers/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Tesseract for OCR
RUN apk add --no-cache tesseract-ocr tesseract-ocr-data-eng

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

USER node

CMD ["node", "dist/worker.js"]
```

### 2.4 Docker Compose (Development)

```yaml
# docker-compose.yml
version: "3.9"

services:
  postgres:
    image: postgres:15-alpine
    container_name: expense_wise_db
    environment:
      POSTGRES_DB: expense_wise
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: expense_wise_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: expense_wise_rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: expense_wise_backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/expense_wise
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
      JWT_SECRET: dev_secret_key
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
      AWS_S3_BUCKET: expense-wise-dev
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  worker:
    build:
      context: ./workers
      dockerfile: Dockerfile
    container_name: expense_wise_worker
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/expense_wise
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    volumes:
      - ./workers:/app
      - /app/node_modules

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: expense_wise_frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/expense_wise
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

---

## 3. Kubernetes Orchestration

### 3.1 Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: expense-wise
  labels:
    name: expense-wise
    environment: production
```

### 3.2 ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: expense-wise-config
  namespace: expense-wise
data:
  NODE_ENV: "production"
  PORT: "4000"
  LOG_LEVEL: "info"
  RATE_LIMIT_WINDOW: "3600000"
  RATE_LIMIT_MAX: "1000"
```

### 3.3 Secrets

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: expense-wise-secrets
  namespace: expense-wise
type: Opaque
data:
  # Base64 encoded values
  DATABASE_URL: <base64-encoded>
  REDIS_URL: <base64-encoded>
  JWT_SECRET: <base64-encoded>
  AWS_ACCESS_KEY_ID: <base64-encoded>
  AWS_SECRET_ACCESS_KEY: <base64-encoded>
```

```bash
# Create secrets from .env
kubectl create secret generic expense-wise-secrets \
  --from-env-file=.env.production \
  --namespace=expense-wise
```

### 3.4 Deployment (Backend API)

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-api
  namespace: expense-wise
  labels:
    app: backend-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend-api
  template:
    metadata:
      labels:
        app: backend-api
        version: v1
    spec:
      containers:
        - name: backend-api
          image: expense-wise/backend:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 4000
              name: http
          env:
            - name: NODE_ENV
              valueFrom:
                configMapKeyRef:
                  name: expense-wise-config
                  key: NODE_ENV
            - name: PORT
              valueFrom:
                configMapKeyRef:
                  name: expense-wise-config
                  key: PORT
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: expense-wise-secrets
                  key: DATABASE_URL
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: expense-wise-secrets
                  key: REDIS_URL
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: expense-wise-secrets
                  key: JWT_SECRET
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 4000
            initialDelaySeconds: 10
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: backend-api-service
  namespace: expense-wise
spec:
  selector:
    app: backend-api
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: ClusterIP
```

### 3.5 Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-api-hpa
  namespace: expense-wise
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
        - type: Pods
          value: 2
          periodSeconds: 30
      selectPolicy: Max
```

### 3.6 Ingress (API Gateway)

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: expense-wise-ingress
  namespace: expense-wise
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "1000"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
    - hosts:
        - api.expense-wise.com
      secretName: expense-wise-tls
  rules:
    - host: api.expense-wise.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend-api-service
                port:
                  number: 4000
```

---

## 4. CI/CD Pipeline

### 4.1 GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: "20"
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.us-east-1.amazonaws.com
  EKS_CLUSTER_NAME: expense-wise-prod

jobs:
  # Step 1: Run Tests
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: expense_wise_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run Prisma migrations
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/expense_wise_test
        run: npx prisma migrate deploy

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript checks
        run: npm run type-check

      - name: Run unit tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/expense_wise_test
          REDIS_URL: redis://localhost:6379
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
          flags: unittests

  # Step 2: Build Docker images
  build:
    name: Build Docker Images
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push backend image
        env:
          ECR_REPOSITORY: expense-wise-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f backend/Dockerfile ./backend
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Build and push frontend image
        env:
          ECR_REPOSITORY: expense-wise-frontend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f Dockerfile .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Build and push worker image
        env:
          ECR_REPOSITORY: expense-wise-worker
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -f workers/Dockerfile ./workers
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  # Step 3: Deploy to Kubernetes
  deploy:
    name: Deploy to EKS
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update kubeconfig
        run: |
          aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME

      - name: Run database migrations
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
        run: |
          npx prisma migrate deploy

      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmap.yaml
          kubectl apply -f k8s/secrets.yaml
          kubectl apply -f k8s/backend-deployment.yaml
          kubectl apply -f k8s/worker-deployment.yaml
          kubectl apply -f k8s/frontend-deployment.yaml
          kubectl apply -f k8s/hpa.yaml
          kubectl apply -f k8s/ingress.yaml

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/backend-api -n expense-wise --timeout=5m
          kubectl rollout status deployment/worker -n expense-wise --timeout=5m
          kubectl rollout status deployment/frontend -n expense-wise --timeout=5m

      - name: Verify deployment
        run: |
          kubectl get pods -n expense-wise
          kubectl get services -n expense-wise
          kubectl get ingress -n expense-wise

      - name: Run smoke tests
        run: |
          npm run test:smoke -- --env=production

  # Step 4: Notify on Slack
  notify:
    name: Send Notification
    needs: [test, build, deploy]
    runs-on: ubuntu-latest
    if: always()

    steps:
      - name: Slack Notification
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment ${{ job.status }}
            Commit: ${{ github.sha }}
            Branch: ${{ github.ref }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 4.2 Pre-deployment Checklist

```bash
#!/bin/bash
# scripts/pre-deploy-check.sh

echo "🔍 Running pre-deployment checks..."

# 1. Check if all tests pass
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

# 2. Check for type errors
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# 3. Check for linting issues
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ Linting errors found"
  exit 1
fi

# 4. Verify database migrations
npx prisma migrate status
if [ $? -ne 0 ]; then
  echo "⚠️  Pending migrations found"
fi

# 5. Check environment variables
required_vars=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "AWS_ACCESS_KEY_ID")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing environment variable: $var"
    exit 1
  fi
done

echo "✅ All pre-deployment checks passed"
```

---

## 5. Infrastructure as Code

### 5.1 Terraform (AWS Infrastructure)

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "expense-wise-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "expense-wise-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = "production"
    Project     = "expense-wise"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.0.0"

  cluster_name    = "expense-wise-prod"
  cluster_version = "1.28"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    general = {
      desired_size = 3
      min_size     = 3
      max_size     = 10

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      labels = {
        role = "general"
      }
    }

    workers = {
      desired_size = 2
      min_size     = 2
      max_size     = 5

      instance_types = ["t3.large"]
      capacity_type  = "SPOT"

      labels = {
        role = "worker"
      }

      taints = [{
        key    = "workload"
        value  = "background"
        effect = "NO_SCHEDULE"
      }]
    }
  }

  tags = {
    Environment = "production"
    Project     = "expense-wise"
  }
}

# RDS PostgreSQL
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "expense-wise-db"

  engine               = "postgres"
  engine_version       = "15.4"
  family               = "postgres15"
  major_engine_version = "15"
  instance_class       = "db.t3.medium"

  allocated_storage     = 100
  max_allocated_storage = 500
  storage_encrypted     = true

  db_name  = "expense_wise"
  username = "dbadmin"
  port     = 5432

  multi_az               = true
  db_subnet_group_name   = module.vpc.database_subnet_group
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  maintenance_window              = "Mon:00:00-Mon:03:00"
  backup_window                   = "03:00-06:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  backup_retention_period         = 30
  skip_final_snapshot             = false
  deletion_protection             = true

  performance_insights_enabled = true
  performance_insights_retention_period = 7

  tags = {
    Environment = "production"
    Project     = "expense-wise"
  }
}

# ElastiCache Redis
module "redis" {
  source  = "terraform-aws-modules/elasticache/aws"
  version = "1.0.0"

  replication_group_id = "expense-wise-redis"
  description          = "Expense-Wise Redis Cluster"

  engine_version = "7.0"
  node_type      = "cache.t3.medium"

  num_cache_clusters = 3
  automatic_failover_enabled = true

  subnet_ids         = module.vpc.private_subnets
  security_group_ids = [aws_security_group.redis_sg.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  maintenance_window = "sun:05:00-sun:06:00"
  snapshot_window    = "03:00-04:00"
  snapshot_retention_limit = 7

  tags = {
    Environment = "production"
    Project     = "expense-wise"
  }
}

# S3 Bucket for Receipts
resource "aws_s3_bucket" "receipts" {
  bucket = "expense-wise-receipts-prod"

  tags = {
    Environment = "production"
    Project     = "expense-wise"
  }
}

resource "aws_s3_bucket_versioning" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "receipts" {
  bucket = aws_s3_bucket.receipts.id

  rule {
    id     = "archive-old-receipts"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    expiration {
      days = 2555  # 7 years
    }
  }
}

# Outputs
output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "redis_endpoint" {
  value = module.redis.primary_endpoint_address
}
```

### 5.2 Terraform Variables

```hcl
# terraform/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.medium"
}
```

---

## 6. Environment Configuration

### 6.1 Environment Variables

**Development (.env.development)**:

```bash
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/expense_wise

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# JWT
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=expense-wise-dev
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Production (.env.production)**:

```bash
NODE_ENV=production
PORT=4000

# Database (use AWS Secrets Manager)
DATABASE_URL=${AWS_SECRETS_DATABASE_URL}

# Redis
REDIS_URL=${AWS_SECRETS_REDIS_URL}

# RabbitMQ
RABBITMQ_URL=${AWS_SECRETS_RABBITMQ_URL}

# JWT
JWT_SECRET=${AWS_SECRETS_JWT_SECRET}
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=expense-wise-receipts-prod

# Email
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=${AWS_SECRETS_SMTP_USER}
SMTP_PASSWORD=${AWS_SECRETS_SMTP_PASSWORD}

# Frontend
NEXT_PUBLIC_API_URL=https://api.expense-wise.com

# Monitoring
SENTRY_DSN=${AWS_SECRETS_SENTRY_DSN}
```

### 6.2 AWS Secrets Manager Integration

```typescript
// src/config/secrets.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

export async function getSecret(secretName: string): Promise<string> {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );
    return response.SecretString || "";
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw error;
  }
}

// Usage
export async function loadSecrets() {
  if (process.env.NODE_ENV === "production") {
    process.env.DATABASE_URL = await getSecret("expense-wise/database-url");
    process.env.JWT_SECRET = await getSecret("expense-wise/jwt-secret");
    process.env.REDIS_URL = await getSecret("expense-wise/redis-url");
  }
}
```

---

## 7. Monitoring & Alerting

### 7.1 Health Check Endpoints

```typescript
// src/routes/health.ts
import express from "express";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

const router = express.Router();

// Basic health check
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness check (checks all dependencies)
router.get("/ready", async (req, res) => {
  const checks = {
    database: false,
    redis: false,
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;

    // Check Redis
    await redis.ping();
    checks.redis = true;

    const allHealthy = Object.values(checks).every((check) => check === true);

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? "ready" : "not ready",
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      checks,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
```

### 7.2 Prometheus Metrics

```typescript
// src/middleware/metrics.ts
import promClient from "prom-client";

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// Metrics endpoint
export function metricsEndpoint(req, res) {
  res.set("Content-Type", register.contentType);
  res.end(register.metrics());
}
```

---

## 8. Backup & Disaster Recovery

### 8.1 Database Backup Strategy

```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/expense_wise_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp "$BACKUP_FILE.gz" "s3://expense-wise-backups/database/$DATE.sql.gz"

# Delete local backup older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### 8.2 Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 1 hour  
**RPO (Recovery Point Objective)**: 6 hours

**Recovery Steps**:

1. **Identify the Issue**

   - Check CloudWatch alarms
   - Review application logs
   - Verify infrastructure status

2. **Restore Database**

   ```bash
   # Download latest backup
   aws s3 cp s3://expense-wise-backups/database/latest.sql.gz .

   # Restore to database
   gunzip latest.sql.gz
   psql $DATABASE_URL < latest.sql
   ```

3. **Restore Application State**

   ```bash
   # Scale up pods
   kubectl scale deployment backend-api --replicas=5 -n expense-wise

   # Verify rollout
   kubectl rollout status deployment/backend-api -n expense-wise
   ```

4. **Verify Recovery**
   - Run smoke tests
   - Check metrics dashboards
   - Validate key user flows

---

**Last Updated**: October 4, 2025  
**Version**: 1.0.0  
**Maintained By**: DevOps Team
