import { IpAddresses, ISecurityGroup, SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'

export class CustomVpc extends Vpc {
  vpcEndpointSg: ISecurityGroup

  constructor(scope: Construct, id: string) {
    super(scope, id, {
      maxAzs: 2,
      ipAddresses: IpAddresses.cidr('10.10.42.0/24'),
      vpcName: 'custom-vpc',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          name: 'private subnet',
        },
        {
          subnetType: SubnetType.PUBLIC,
          mapPublicIpOnLaunch: false,
          name: 'public subnet',
        },
      ],
    })

    this.vpcEndpointSg = new SecurityGroup(this, 'vpce-sg', {
      vpc: this,
      allowAllOutbound: true,
    })
  }
}
