import {CodeBuildStep, CodeBuildStepProps, IFileSetProducer} from "aws-cdk-lib/pipelines";
import {IVpc, SubnetType} from "aws-cdk-lib/aws-ec2";
import {ComputeType, LinuxArmBuildImage} from "aws-cdk-lib/aws-codebuild";

export interface BuildStepProps {
  vpc: IVpc
  source: IFileSetProducer
}

export class BuildStep extends CodeBuildStep {
  constructor(id: string, props: BuildStepProps) {
    const codeBuildStepProps: CodeBuildStepProps = {
      input: props.source,
      vpc: props.vpc,
      subnetSelection: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS
      },
      buildEnvironment: {
        computeType: ComputeType.SMALL,
        buildImage: LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_3_0,
        privileged: true,
      },
      installCommands: [
        'npm install -g @go-task/cli'
      ],
      commands: [
        'task build'
      ],
      primaryOutputDirectory: 'infrastructure/cdk.out'
    }
    super(id, codeBuildStepProps);
  }
}