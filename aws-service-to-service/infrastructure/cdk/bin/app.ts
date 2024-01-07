#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CloudMapStack } from '../lib/stacks/cloud-map-stack'
import { CoreStack } from '../lib/stacks/core-stack'
import { CloudMapPublicDnsStack } from '../lib/stacks/cloud-map-stack-public-dns'
import { CloudMapServiceConnectStack } from '../lib/stacks/cloud-map-stack-service-connect'
import { AppMeshStack } from '../lib/stacks/app-mesh-stack'

const app = new cdk.App()

const coreStack = new CoreStack(app, 'CoreStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION,
  },
})

// new CloudMapStack(app, 'CloudMapStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION,
//   },
//   vpc: coreStack.vpc,
// })
//
// new CloudMapPublicDnsStack(app, 'CloudMapPublicDnsStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION,
//   },
//   vpc: coreStack.vpc,
// })
//
// new CloudMapServiceConnectStack(app, 'CloudMapServiceConnectStack', {
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION,
//   },
//   vpc: coreStack.vpc,
// })

new AppMeshStack(app, 'AppMeshStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION,
  },
  vpc: coreStack.vpc,
})

app.synth()
