#!/usr/bin/env bash

set -euo pipefail

QUEUE_URL=$(aws sqs get-queue-url --queue-name messages | jq -r .QueueUrl)

function send_message() {
  message=$1
  for i in {1..50}; do
    echo "send message number: $i, message payload: $message"
    aws sqs send-message --queue-url "$QUEUE_URL" --message-body "$message" &> /dev/null &
  done
  wait
}

send_message "fail" &
send_message "asdf" &

wait
