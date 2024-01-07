package main

import (
	"context"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"log"
)

func HandleRequest(ctx context.Context, event events.SQSEvent) (events.SQSEventResponse, error) {
	failedItems := make([]events.SQSBatchItemFailure, 0)

	log.Printf("Number of records: %d", len(event.Records))

	for _, record := range event.Records {
		if record.Body == "fail" {
			failedItems = append(failedItems, events.SQSBatchItemFailure{ItemIdentifier: record.MessageId})
			log.Printf("Message with body: %s is unprocessable", record.Body)
		} else {
			log.Printf("Message with body: %s successfully processed", record.Body)
		}
	}

	log.Printf("Number of failed messages: %d", len(failedItems))

	return events.SQSEventResponse{
		BatchItemFailures: failedItems,
	}, nil
}

func main() {
	lambda.Start(HandleRequest)
}
