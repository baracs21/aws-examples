import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Topic} from 'aws-cdk-lib/aws-sns';
import {Queue} from 'aws-cdk-lib/aws-sqs';
import {SqsEventSource} from 'aws-cdk-lib/aws-lambda-event-sources';
import {SqsSubscription} from 'aws-cdk-lib/aws-sns-subscriptions';
import {Code, Runtime, Function} from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class InfrastructureStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const queue = new Queue(this, 'sns-queue', {
            queueName: 'test-queue',
            visibilityTimeout: Duration.seconds(10),
            deadLetterQueue: {
                queue: new Queue(this, 'sns-queue-dlq', {
                    queueName: 'test-queue-dlq'
                }),
                maxReceiveCount: 2
            }
        });

        const sns = new Topic(this, 'sourceTopic', {
            topicName: 'test-topic'
        })

        const eventSource = new SqsEventSource(queue, {
            reportBatchItemFailures: true,
            batchSize: 20,
            enabled: true
        })

        sns.addSubscription(new SqsSubscription(queue, {
            rawMessageDelivery: true
        }))

        const sqsProcessorFunc = new Function(this, 'sqs-processor', {
            runtime: Runtime.GO_1_X,
            code: Code.fromAsset(path.join(__dirname, '../../src/golang/build/sqs-processor.zip')),
            handler: 'sqs-processor',
            functionName: 'sqs-processor-fn',
            memorySize: 128
        })

        sqsProcessorFunc.addEventSource(eventSource)

    }
}
