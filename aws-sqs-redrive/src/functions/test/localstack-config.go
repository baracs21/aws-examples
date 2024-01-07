package localstack

import (
	"context"
	"fmt"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

type TestClient struct {
	SqsClient *sqs.Client
}

func TestCfg() aws.Config {
	localStackUrl := "http://localhost:4566"

	//https://aws.github.io/aws-sdk-go-v2/docs/configuring-sdk/endpoints/
	localstackResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			PartitionID:   "aws",
			URL:           localStackUrl,
			SigningRegion: "eu-west-1",
		}, nil
	})

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(localstackResolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider("dummy", "dummy", "dummy")),
		config.WithRegion("eu-west-1"),
	)

	if err != nil {
		fmt.Println(err)
	}

	return cfg
}

func CreateQueue(queueName string) string {
	sqsClient := NewLocalStackClient().SqsClient
	createQueueResponse, err := sqsClient.CreateQueue(context.TODO(), &sqs.CreateQueueInput{
		QueueName: aws.String(queueName),
	})
	if err != nil {
		fmt.Println(err)
	}

	return *createQueueResponse.QueueUrl
}

func PurgeQueue(queueUrl string) {
	sqsClient := NewLocalStackClient().SqsClient
	_, _ = sqsClient.PurgeQueue(context.TODO(), &sqs.PurgeQueueInput{QueueUrl: aws.String(queueUrl)})
}

func DeleteQueue(queueUrl string) {
	sqsClient := NewLocalStackClient().SqsClient
	_, _ = sqsClient.DeleteQueue(context.TODO(), &sqs.DeleteQueueInput{
		QueueUrl: aws.String(queueUrl),
	})
}

func ReceiveMessages(queueUrl string) []string {
	sqsClient := NewLocalStackClient().SqsClient
	messages, _ := sqsClient.ReceiveMessage(context.TODO(), &sqs.ReceiveMessageInput{
		QueueUrl:            aws.String(queueUrl),
		MaxNumberOfMessages: 10,
		VisibilityTimeout:   0,
		WaitTimeSeconds:     0,
	})
	result := make([]string, 0)

	for _, message := range messages.Messages {
		result = append(result, *message.Body)
	}
	return result
}

func NewLocalStackClient() *TestClient {
	return &TestClient{
		SqsClient: sqs.NewFromConfig(TestCfg()),
	}
}
