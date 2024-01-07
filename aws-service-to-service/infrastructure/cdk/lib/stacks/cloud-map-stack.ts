import * as cdk from 'aws-cdk-lib'
import { CfnOutput, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { IVpc, Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2'
import { Cluster } from 'aws-cdk-lib/aws-ecs'
import { NamespaceType } from 'aws-cdk-lib/aws-servicediscovery'
import { CustomEcs } from '../components/custom-ecs'
import { ApplicationLoadBalancer, ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2'

export interface CloudMapStackProperties extends StackProps {
  vpc: IVpc
}

export class CloudMapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudMapStackProperties) {
    super(scope, id, props)

    const cluster = new Cluster(this, 'cloud-map-cluster', {
      vpc: props.vpc,
      clusterName: 'cloud-map-cluster',
      defaultCloudMapNamespace: {
        type: NamespaceType.DNS_PRIVATE,
        name: 'cloud-map-private-dns',
      },
    })

    const app1 = new CustomEcs(this, 'cloud-map-ecs-app-1', {
      vpc: props.vpc,
      serviceName: 'cm-pdns-app-1',
      appFolder: 'app-1',
      cluster,
    })

    app1.service.enableCloudMap({
      name: app1.serviceName,
      containerPort: app1.container.containerPort,
      container: app1.container,
    })

    const app2 = new CustomEcs(this, 'cloud-map-ecs-app-2', {
      vpc: props.vpc,
      serviceName: 'cm-pdns-app-2',
      appFolder: 'app-2',
      cluster,
    })

    app2.service.enableCloudMap({
      name: app2.serviceName,
      containerPort: app2.container.containerPort,
      container: app2.container,
    })

    const sg = new SecurityGroup(this, 'alb-sg', {
      vpc: props.vpc,
      allowAllOutbound: true,
    })
    sg.addIngressRule(Peer.ipv4('45.118.184.93/32'), Port.tcp(80))

    const publicAlb = new ApplicationLoadBalancer(this, 'public-alb', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      internetFacing: true,
      loadBalancerName: 'public-alb',
      securityGroup: sg,
    })

    const listener = publicAlb.addListener('listener', {
      open: true,
      port: 80,
      defaultAction: ListenerAction.fixedResponse(403),
    })

    listener.addTargetGroups('clusterTarget', {
      targetGroups: [
        app1.createTargetGroup(),
      ],
      conditions: [
        ListenerCondition.pathPatterns(['/*']),
      ],
      priority: 1,
    })

    new CfnOutput(this, 'alb-url', {
      value: publicAlb.loadBalancerDnsName,
    })
  }
}
