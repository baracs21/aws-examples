package main

import (
	"baracs/sqs-redrive/src/adapters"
	"baracs/sqs-redrive/src/usecases"
	"context"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

type RedriveEvent struct {
	SourceQueueUrl string `json:"SourceQueueUrl"`
	TargetQueueUrl string `json:"TargetQueueUrl"`
}

func HandleRequest(ctx context.Context, event RedriveEvent) error {
	awsConfig, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return err
	}

	redriveMessagesContext := usecases.RedriveMessagesContext{
		Source: adapters.NewSqsClient(ctx, event.SourceQueueUrl, sqs.NewFromConfig(awsConfig)),
		Target: adapters.NewSqsClient(ctx, event.TargetQueueUrl, sqs.NewFromConfig(awsConfig)),
	}

	redriveUsecase := usecases.NewRedriveMessagesUseCase(redriveMessagesContext)

	return redriveUsecase.RedriveMessages()
}

func main() {
	lambda.Start(HandleRequest)
}
