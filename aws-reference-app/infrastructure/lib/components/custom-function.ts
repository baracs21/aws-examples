import {Architecture, Code, Function, FunctionProps, Runtime} from 'aws-cdk-lib/aws-lambda';
import {Construct} from "constructs";
import path from "path";

export interface CustomFunctionProps {
  functionFile: string
  functionName: string
}

export class CustomFunction extends Function {
  constructor(scope: Construct, id: string, props: CustomFunctionProps) {
    super(scope, id, {
      runtime: Runtime.PROVIDED_AL2023,
      functionName: props.functionName,
      handler: 'bootstrap',
      architecture: Architecture.ARM_64,
      code: Code.fromAsset(path.join('..', 'build', 'functions', props.functionFile)),
    })
  }
}