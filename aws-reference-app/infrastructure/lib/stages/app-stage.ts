import * as cdk from 'aws-cdk-lib';
import {DefaultStackSynthesizer, StageProps, Tags} from 'aws-cdk-lib';
import {Construct} from "constructs";
import {AppStack} from "../stacks/app-stack";
import {APP_NAME} from "../../config/config";

export interface StageDefinition extends StageProps {
  isProductionStage: boolean
  isActive: boolean
}

export class AppStage extends cdk.Stage {

  constructor(scope: Construct, id: string, props: StageDefinition) {
    super(scope, id, props);

    new AppStack(this, `${APP_NAME}-stack`, {
      synthesizer: new DefaultStackSynthesizer({
        dockerTagPrefix: `${APP_NAME}-${props.stageName}`,
      }),
      env: props.env,
      stackName: `${APP_NAME}-stack-${props.stageName}`,
      stageName: props.stageName!,
    });

    Tags.of(this).add('service', `${APP_NAME}-${props.stageName}`)
  }
}