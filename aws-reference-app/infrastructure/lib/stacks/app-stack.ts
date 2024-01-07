import * as cdk from 'aws-cdk-lib';
import {StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Architecture, Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import path from "path";
import {CustomFunction} from "../components/custom-function";

export interface StackDefinition extends StackProps {
  stageName: string
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackDefinition) {
    super(scope, id, props);

    new CustomFunction(this, 'dummy-function-1', {
      functionFile: 'dummy-handler-1.zip',
      functionName: `dummy-function-1-${props.stageName}`
    })

    new CustomFunction(this, 'dummy-function-2', {
      functionFile: 'dummy-handler-2.zip',
      functionName: `dummy-function-2-${props.stageName}`
    })
  }
}