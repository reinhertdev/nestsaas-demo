# AWS Deployment Guide

The NestJS API deploys to **AWS ECS Fargate** behind an **Application Load Balancer**. Infrastructure is managed with **AWS CDK** (TypeScript).

## Architecture

```
Internet → ALB (port 80/443)
             → ECS Fargate Task (port 3001)
                  ← Docker image from ECR
                  ← Secrets from SSM Parameter Store
```

## Prerequisites

- An AWS account
- AWS CLI installed and configured (`aws configure`)
- Docker installed

## Step 1 — Install CDK CLI

```bash
npm install -g aws-cdk
```

## Step 2 — Bootstrap CDK (first time only)

```bash
cd infra
npm install
npx cdk bootstrap
```

This creates the S3 bucket and IAM roles CDK needs to deploy.

## Step 3 — Store secrets in SSM Parameter Store

Run these commands with your actual values:

```bash
aws ssm put-parameter --name "/nestsaas/production/DATABASE_URL"              --value "postgresql://..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/DIRECT_URL"                --value "postgresql://..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/SUPABASE_URL"              --value "https://xxx.supabase.co" --type SecureString
aws ssm put-parameter --name "/nestsaas/production/SUPABASE_SERVICE_ROLE_KEY" --value "eyJ..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_SECRET_KEY"         --value "sk_live_..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_WEBHOOK_SECRET"     --value "whsec_..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_PRICE_ID_MONTHLY"   --value "price_..." --type SecureString
aws ssm put-parameter --name "/nestsaas/production/STRIPE_PRICE_ID_YEARLY"    --value "price_..." --type SecureString
```

## Step 4 — Deploy the CDK stack

```bash
cd infra
npx cdk deploy
```

This creates:
- VPC with public/private subnets across 2 AZs
- ECR repository (`nestsaas-api`)
- ECS cluster (`nestsaas-cluster`)
- Fargate task definition (0.25 vCPU / 512 MB)
- Application Load Balancer
- ECS service (`nestsaas-api`)

At the end, CDK prints the **ALB DNS name**. Save this — you'll use it as `API_URL` in your Next.js config.

## Step 5 — Build and push the first Docker image

```bash
# Get your ECR registry URI from the CDK output
ECR_REGISTRY=<your-account-id>.dkr.ecr.ap-northeast-1.amazonaws.com
ECR_REPO=nestsaas-api

# Authenticate Docker with ECR
aws ecr get-login-password --region ap-northeast-1 \
  | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push from the repo root
docker build -f apps/api/Dockerfile -t $ECR_REGISTRY/$ECR_REPO:latest .
docker push $ECR_REGISTRY/$ECR_REPO:latest
```

## Step 6 — Force a new ECS deployment

```bash
aws ecs update-service \
  --cluster nestsaas-cluster \
  --service nestsaas-api \
  --force-new-deployment \
  --region ap-northeast-1
```

## Step 7 — Set up GitHub Actions (automated deploys)

Add these secrets to your GitHub repository (**Settings → Secrets → Actions**):

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

> Create a dedicated IAM user with permissions for ECR push and ECS update-service. Avoid using your root account credentials.

After this, every push to `main` that touches `apps/api/` will automatically build and deploy.

## Step 8 — Update your Stripe webhook

Update your Stripe webhook endpoint URL to point to your ALB:

```
http://<alb-dns-name>/api/stripe/webhook
```

> To use HTTPS, attach an ACM certificate to the ALB listener and update the CDK stack to use port 443.

## Estimated AWS costs

| Resource | Estimated monthly cost |
|---|---|
| ECS Fargate (0.25 vCPU / 512 MB) | ~$10 |
| ALB | ~$20 |
| NAT Gateway | ~$35 |
| ECR storage | ~$1 |
| **Total** | **~$65/month** |

> To reduce costs in staging/dev, you can remove the NAT Gateway and use `assignPublicIp: true` in the ECS service config.
