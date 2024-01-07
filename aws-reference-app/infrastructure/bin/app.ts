#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {PipelineStack} from "../lib/stacks/pipeline-stack";
import {GITHUB, PIPELINE_ACCOUNT_ID} from "../config/config";

const app = new cdk.App();

new PipelineStack(app, 'PipelineStack', {
  env: {
    account: PIPELINE_ACCOUNT_ID,
    region: 'eu-west-1'
  },
  github: GITHUB
});

app.synth()