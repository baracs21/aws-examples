#!/usr/bin/env bash

set -euo pipefail

QUEUE_URL=$(aws sqs get-queue-url --queue-name messages | jq -r .QueueUrl)
QUEUE_URL_DLQ=$(aws sqs get-queue-url --queue-name messages-dlq | jq -r .QueueUrl)

QUEUE_ATTRIBUTES=$(aws sqs get-queue-attributes --queue-url "$QUEUE_URL" --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible)
QUEUE_ATTRIBUTES_DLQ=$(aws sqs get-queue-attributes --queue-url "$QUEUE_URL_DLQ" --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible)

echo "ApproximateNumberOfMessages in Queue messages:               $(echo "$QUEUE_ATTRIBUTES" | jq -r .Attributes.ApproximateNumberOfMessages)"
echo "ApproximateNumberOfMessages in Queue messages in flight:     $(echo "$QUEUE_ATTRIBUTES" | jq -r .Attributes.ApproximateNumberOfMessagesNotVisible)"
echo "ApproximateNumberOfMessages in Queue messages-dlq:           $(echo "$QUEUE_ATTRIBUTES_DLQ" | jq -r .Attributes.ApproximateNumberOfMessages)"
echo "ApproximateNumberOfMessages in Queue messages-dlq in flight: $(echo "$QUEUE_ATTRIBUTES_DLQ" | jq -r .Attributes.ApproximateNumberOfMessagesNotVisible)"
