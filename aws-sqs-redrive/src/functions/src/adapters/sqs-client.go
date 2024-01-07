package adapters

import (
	"context"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"
	"strconv"
)

type SqsClient struct {
	client   *sqs.Client
	ctx      context.Context
	queueUrl string
}

func (s *SqsClient) ReceiveMessages() ([]types.Message, error) {
	response, err := s.client.ReceiveMessage(s.ctx, &sqs.ReceiveMessageInput{
		QueueUrl:            aws.String(s.queueUrl),
		MaxNumberOfMessages: 10,
		VisibilityTimeout:   300,
		WaitTimeSeconds:     20,
	})
	if err != nil {
		return nil, err
	}
	return response.Messages, err
}

func (s *SqsClient) MessagesInQueue() (int, error) {
	queueAttributes, err := s.client.GetQueueAttributes(s.ctx, &sqs.GetQueueAttributesInput{
		QueueUrl: aws.String(s.queueUrl),
		AttributeNames: []types.QueueAttributeName{
			types.QueueAttributeNameApproximateNumberOfMessages,
		},
	})
	if err != nil {
		return 0, err
	}
	appMessagesNumber, err := strconv.Atoi(queueAttributes.Attributes["ApproximateNumberOfMessages"])
	if err != nil {
		return 0, err
	}

	return appMessagesNumber, nil
}

func (s *SqsClient) SendMessage(message string) error {
	_, err := s.client.SendMessage(s.ctx, &sqs.SendMessageInput{
		MessageBody: aws.String(message),
		QueueUrl:    aws.String(s.queueUrl),
	})
	return err
}

func (s *SqsClient) DeleteMessage(message types.Message) error {
	_, err := s.client.DeleteMessage(s.ctx, &sqs.DeleteMessageInput{
		QueueUrl:      aws.String(s.queueUrl),
		ReceiptHandle: message.ReceiptHandle,
	})
	return err
}

func (s *SqsClient) QueueUrl() string {
	return s.queueUrl
}

func NewSqsClient(ctx context.Context, queueUrl string, client *sqs.Client) *SqsClient {
	return &SqsClient{
		client:   client,
		ctx:      ctx,
		queueUrl: queueUrl,
	}
}
