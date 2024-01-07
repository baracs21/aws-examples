import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep} from 'aws-cdk-lib/pipelines';
import {AppStage} from "../stages/app-stage";
import {APP_NAME, GitHubRepo} from "../../config/config";
import {IpAddresses, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {BuildStep} from "../components/pipeline/build-step";
import {StageDefinitions} from "../../config/stage-definitions";
import {BlockPublicAccess, Bucket, BucketAccessControl} from "aws-cdk-lib/aws-s3";

export interface PipelineStackProps extends cdk.StackProps {
  readonly github: GitHubRepo
}

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: PipelineStackProps) {
    super(scope, id, props);

    const source = this.getGithubSource(props!.github);

    const vpc = new Vpc(this, 'pipeline-vpc', {
      ipAddresses: IpAddresses.cidr('10.42.1.0/24'),
      maxAzs: 1,
      vpcName: `${APP_NAME}-pipeline-vpc`,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          mapPublicIpOnLaunch: false
        },
        {
          name: 'private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        }
      ]
    })

    const buildStep = new BuildStep('build-step', {
      source: source,
      vpc: vpc,
    })

    const artifactBucket = new Bucket(this, 'artifact-bucket', {
      bucketName: `${APP_NAME}-artifacts`,
      autoDeleteObjects: true,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [
        {
          enabled: true,
          expiration: cdk.Duration.days(7),
        }
      ]
    })

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: `${APP_NAME}-pipeline`,
      selfMutation: true,
      artifactBucket: artifactBucket,
      dockerEnabledForSynth: true,
      synth: buildStep,
    });
    pipeline.node.addDependency(vpc)

    for (const stageDefinition of StageDefinitions.STAGES) {
      if (stageDefinition.isActive) {
        const stage = pipeline.addStage(new AppStage(this, stageDefinition.stageName!, stageDefinition));
        if (stageDefinition.isProductionStage) {
          stage.addPre(new ManualApprovalStep('approval'));
        }
        stage.addPost(
          new ShellStep("validate", {
            input: source,
            commands: ['sh ./tests/validate.sh'],
          }),
          new ShellStep("validate-with-build-output", {
            input: buildStep,
            commands: ['ls -la'],
          }),
        );
      }
    }
  }

  private getGithubSource(props: GitHubRepo): CodePipelineSource {
    return CodePipelineSource.connection(`${props?.owner}/${props?.repo}`, props!.branch, {
      triggerOnPush: true,
      actionName: 'Source',
      connectionArn: props!.codestarConnectionArn
    });
  }
}