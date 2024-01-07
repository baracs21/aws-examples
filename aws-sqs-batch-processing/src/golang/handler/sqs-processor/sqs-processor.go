package main

import (
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func HandleRequest(event events.SQSEvent) events.SQSEventResponse {
	failedItems := make([]events.SQSBatchItemFailure, 0)

	for _, record := range event.Records {
		failedItems = append(failedItems, events.SQSBatchItemFailure{ItemIdentifier: record.MessageId})
	}

	return events.SQSEventResponse{BatchItemFailures: failedItems}
}

func main() {
	lambda.Start(HandleRequest)
}
