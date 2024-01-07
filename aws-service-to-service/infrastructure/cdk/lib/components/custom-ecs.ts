import { Construct } from 'constructs'
import {
  AppMeshProxyConfiguration,
  ContainerDefinition,
  ContainerDependencyCondition,
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  ICluster,
  LogDriver,
  OperatingSystemFamily,
} from 'aws-cdk-lib/aws-ecs'
import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets'
import path from 'path'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { IVpc, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { ApplicationProtocol, ApplicationTargetGroup, Protocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import {
  HealthCheck,
  Mesh,
  VirtualNode,
  VirtualNodeListener,
  VirtualService,
  VirtualServiceProvider,
} from 'aws-cdk-lib/aws-appmesh'

export interface CustomEcsProps {
  vpc: IVpc
  serviceName: string
  appFolder: string
  cluster: ICluster
  env?: {[key: string]: string}
  meshEnabled?: boolean
}

export class CustomEcs extends Construct {
  service: FargateService
  taskDefinition: FargateTaskDefinition
  serviceName: string
  container: ContainerDefinition
  vpc: IVpc
  portMappingName: string

  constructor(scope: Construct, id: string, props: CustomEcsProps) {
    super(scope, id)

    this.taskDefinition = new FargateTaskDefinition(scope, `${props.serviceName}-task-definition`, {
      proxyConfiguration: props.meshEnabled !== undefined && props.meshEnabled
        ? new AppMeshProxyConfiguration({
          containerName: 'envoy',
          properties: {
            appPorts: [
              8080,
            ],
            proxyIngressPort: 15000,
            proxyEgressPort: 15001,
            egressIgnoredIPs: ['169.254.170.2', '169.254.169.254', '127.0.0.1'],
            ignoredUID: 1337,
          },
        })
        : undefined,
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: CpuArchitecture.ARM64,
        operatingSystemFamily: OperatingSystemFamily.LINUX,
      },
    })

    this.serviceName = props.serviceName
    this.vpc = props.vpc
    this.portMappingName = `${props.serviceName}-port-mapping`

    this.container = this.taskDefinition.addContainer('container', {
      containerName: props.serviceName,
      image: ContainerImage.fromDockerImageAsset(new DockerImageAsset(scope, `${props.serviceName}-image`, {
        directory: path.join(__dirname, '..', '..', '..', '..', 'src', props.appFolder),
        platform: Platform.LINUX_ARM64,
      })),
      healthCheck: {
        command: [
          'curl http://localhost:8080/status',
        ],
        retries: 3,
        interval: Duration.seconds(10),
      },
      logging: LogDriver.awsLogs({
        logGroup: new LogGroup(this, props.serviceName, {
          logGroupName: props.serviceName,
          removalPolicy: RemovalPolicy.DESTROY,
          retention: RetentionDays.ONE_DAY,
        }),
        streamPrefix: 'ecs',
      }),
      environment: props.env,
      portMappings: [
        {
          containerPort: 8080,
          hostPort: 8080,
          name: this.portMappingName,
        },
      ],
    })

    const sg = new SecurityGroup(scope, `${props.serviceName}-sg`, {
      vpc: props.vpc,
      allowAllOutbound: true,
    })
    sg.addIngressRule(Peer.ipv4(props.vpc.vpcCidrBlock), Port.tcp(8080))

    this.service = new FargateService(scope, `${props.serviceName}-fargate-service`, {
      serviceName: props.serviceName,
      cluster: props.cluster,
      taskDefinition: this.taskDefinition,
      securityGroups: [
        sg,
      ],

      desiredCount: 1,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    })
  }

  public createAppMesh(virtualNode: VirtualNode) {
    const envoy = new ContainerDefinition(this, 'envoy-proxy', {
      image: ContainerImage.fromRegistry('public.ecr.aws/appmesh/aws-appmesh-envoy:v1.27.2.0-prod'),
      taskDefinition: this.taskDefinition,
      containerName: 'envoy',
      healthCheck: {
        command: ['CMD-SHELL', 'curl -s http://localhost:9901/server_info | grep state | grep -q LIVE'],
        interval: Duration.seconds(5),
        retries: 3,
        startPeriod: Duration.seconds(10),
        timeout: Duration.seconds(2),
      },
      environment: {
        name: 'APPMESH_RESOURCE_ARN',
        value: virtualNode.virtualNodeArn,
      },
      user: '1337',
      essential: true,
    })

    this.container.addContainerDependencies({
      container: envoy,
      condition: ContainerDependencyCondition.HEALTHY,
    })
  }

  public createVirtualNode(mesh: Mesh): VirtualNode {
    return new VirtualNode(this, `${this.serviceName}-virtual-node`, {
      mesh,
      listeners: [
        VirtualNodeListener.http({
          port: this.container.containerPort,
          healthCheck: HealthCheck.http({
            path: '/status',
          }),
        }),
      ],
    })
  }

  public createVirtualService(virtualNode: VirtualNode): VirtualService {
    return new VirtualService(this, `${this.serviceName}-virtual-service`, {
      virtualServiceName: `${this.serviceName}.${this.service.cluster.defaultCloudMapNamespace?.namespaceName}`,
      virtualServiceProvider: VirtualServiceProvider.virtualNode(virtualNode),
    })
  }

  public createTargetGroup(): ApplicationTargetGroup {
    return new ApplicationTargetGroup(this, `${this.serviceName}-tg`, {
      protocol: ApplicationProtocol.HTTP,
      port: 8080,
      vpc: this.vpc,
      targets: [this.service],
      healthCheck: {
        port: '8080',
        protocol: Protocol.HTTP,
        path: '/status',
        interval: Duration.seconds(180),
        timeout: Duration.seconds(30),
        unhealthyThresholdCount: 5,
        healthyThresholdCount: 5,
      },
    })
  }
}
