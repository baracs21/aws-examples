import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Queue} from "aws-cdk-lib/aws-sqs";
import * as path from "path";
import {Code, Runtime, Function} from "aws-cdk-lib/aws-lambda";
import {SqsEventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Rule, RuleTargetInput, Schedule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";

export class SqsRedriveStackExample extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new Queue(this, 'MessageQueue', {
      queueName: 'messages',
      visibilityTimeout: Duration.seconds(60),
      deadLetterQueue: {
        queue: new Queue(this, 'MessageQueueDlq', {
          queueName: 'messages-dlq'
        }),
        maxReceiveCount: 1
      }
    });

    const messageConsumerFunc = new Function(this, 'message-consumer', {
      runtime: Runtime.GO_1_X,
      code: Code.fromAsset(path.join(__dirname, '../../.build/message-consumer.zip')),
      handler: 'message-consumer',
      functionName: 'message-consumer',
      memorySize: 128,
      logRetention: RetentionDays.ONE_DAY,
    });
    queue.grantConsumeMessages(messageConsumerFunc);

    const sqsEventSource = new SqsEventSource(queue, {
      enabled: true,
      batchSize: 50,
      reportBatchItemFailures: true,
      maxBatchingWindow: Duration.minutes(1)
    });

    messageConsumerFunc.addEventSource(sqsEventSource)

    const sqsRedriveFunc = new Function(this, 'redrive-function', {
      runtime: Runtime.GO_1_X,
      code: Code.fromAsset(path.join(__dirname, '../../.build/sqs-redrive.zip')),
      handler: 'sqs-redrive',
      functionName: 'sqs-redrive',
      memorySize: 128,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_DAY,
      reservedConcurrentExecutions: 1
    });

    const redriveRule = new Rule(this, 'redrive-rule', {
      enabled: true,
      description: 'reprocess failed messages',
      ruleName: `${queue.deadLetterQueue?.queue.queueName}-${queue.queueName}-redrive`,
      schedule: Schedule.rate(Duration.minutes(1))
    });

    redriveRule.addTarget(new LambdaFunction(sqsRedriveFunc, {
      event: RuleTargetInput.fromObject({
        SourceQueueUrl: `${queue.deadLetterQueue?.queue.queueUrl}`,
        TargetQueueUrl: `${queue.queueUrl}`
      })
    }))

    queue.grantSendMessages(sqsRedriveFunc);
    queue.deadLetterQueue?.queue.grantConsumeMessages(sqsRedriveFunc);
  }

}
