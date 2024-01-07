import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {SubnetType, Vpc, VpcEndpointService} from "aws-cdk-lib/aws-ec2";
import {
  ApplicationLoadBalancer,
  NetworkLoadBalancer,
  Protocol,
  SslPolicy
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import {AlbTarget} from "aws-cdk-lib/aws-elasticloadbalancingv2-targets";

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'my-vpc', {
        vpcName: 'vpce-service-vpc',
        maxAzs: 2,
        cidr: '10.10.42.0/24',
        enableDnsHostnames: true,
        enableDnsSupport: true,
        subnetConfiguration: [
          {
            subnetType: SubnetType.PRIVATE_ISOLATED,
            name: 'iso-net'
          }
        ]
      }
    )

    const nlb = new NetworkLoadBalancer(this, 'my-nlb', {
      vpc: vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      },
      loadBalancerName: 'vpce-service-nlb',
    })

    const vpceService = new VpcEndpointService(this, 'my-endpoint-service', {
      vpcEndpointServiceLoadBalancers: [
        nlb
      ],
      acceptanceRequired: true
    })

    const nlbListener = nlb.addListener('nlb-listener', {
      port: 443,
      sslPolicy: SslPolicy.FORWARD_SECRECY_TLS12_RES_GCM,
      protocol: Protocol.TCP
    })

    const alb = new ApplicationLoadBalancer(this, 'my-alb', {
      vpc: vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
      loadBalancerName: 'vpce-service-alb',
    })

    nlbListener.addTargets('asdf', {
      port: 443,
      protocol: Protocol.TLS,
      targets: [
        new AlbTarget(alb, 80)
      ]
    })

  }
}
