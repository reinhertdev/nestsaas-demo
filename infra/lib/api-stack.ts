import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- VPC ---
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
      ],
    });

    // --- ECR ---
    const repository = new ecr.Repository(this, 'ApiRepository', {
      repositoryName: 'nestsaas-api',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        // 最新10イメージのみ保持してコストを抑える
        { maxImageCount: 10 },
      ],
    });

    // --- ECS Cluster ---
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'nestsaas-cluster',
      containerInsights: true,
    });

    // --- CloudWatch Logs ---
    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: '/ecs/nestsaas-api',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- Task Definition ---
    const taskDef = new ecs.FargateTaskDefinition(this, 'ApiTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    taskDef.addContainer('ApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(repository, 'latest'),
      portMappings: [{ containerPort: 3001 }],
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'api',
      }),
      // 環境変数は SSM Parameter Store から取得
      // デプロイ前に aws ssm put-parameter で設定すること（README 参照）
      secrets: {
        DATABASE_URL: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'DbUrl', {
            parameterName: '/nestsaas/production/DATABASE_URL',
          }),
        ),
        DIRECT_URL: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'DirectUrl', {
            parameterName: '/nestsaas/production/DIRECT_URL',
          }),
        ),
        SUPABASE_URL: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'SupabaseUrl', {
            parameterName: '/nestsaas/production/SUPABASE_URL',
          }),
        ),
        SUPABASE_SERVICE_ROLE_KEY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'SupabaseKey', {
            parameterName: '/nestsaas/production/SUPABASE_SERVICE_ROLE_KEY',
          }),
        ),
        STRIPE_SECRET_KEY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'StripeKey', {
            parameterName: '/nestsaas/production/STRIPE_SECRET_KEY',
          }),
        ),
        STRIPE_WEBHOOK_SECRET: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'StripeWebhook', {
            parameterName: '/nestsaas/production/STRIPE_WEBHOOK_SECRET',
          }),
        ),
        STRIPE_PRICE_ID_MONTHLY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'StripePriceMonthly', {
            parameterName: '/nestsaas/production/STRIPE_PRICE_ID_MONTHLY',
          }),
        ),
        STRIPE_PRICE_ID_YEARLY: ecs.Secret.fromSsmParameter(
          ssm.StringParameter.fromSecureStringParameterAttributes(this, 'StripePriceYearly', {
            parameterName: '/nestsaas/production/STRIPE_PRICE_ID_YEARLY',
          }),
        ),
      },
      environment: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    });

    // ECR pull 権限を付与
    repository.grantPull(taskDef.taskRole);

    // --- ALB Security Group ---
    const albSg = new ec2.SecurityGroup(this, 'AlbSg', {
      vpc,
      description: 'ALB security group',
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP');
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS');

    // --- ECS Security Group ---
    const ecsSg = new ec2.SecurityGroup(this, 'EcsSg', {
      vpc,
      description: 'ECS tasks security group',
    });
    ecsSg.addIngressRule(albSg, ec2.Port.tcp(3001), 'From ALB');

    // --- ALB ---
    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
      loadBalancerName: 'nestsaas-alb',
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    // --- ECS Service ---
    const service = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      securityGroups: [ecsSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      serviceName: 'nestsaas-api',
      assignPublicIp: false,
    });

    listener.addTargets('ApiTarget', {
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // --- Outputs ---
    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
      description: 'ALB DNS name — set this as your API_URL',
    });

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: repository.repositoryUri,
      description: 'ECR repository URI for CI/CD',
    });

    new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
      description: 'ECS cluster name',
    });

    new cdk.CfnOutput(this, 'EcsServiceName', {
      value: service.serviceName,
      description: 'ECS service name',
    });
  }
}
