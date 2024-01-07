import { Stack, StackProps } from 'aws-cdk-lib'
import { IVpc } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { CustomVpc } from '../components/custom-vpc'

export class CoreStack extends Stack {
  vpc: IVpc

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    this.vpc = new CustomVpc(this, 'custom-vpc')
  }
}
