package localstack

import (
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sqs/types"
	"github.com/google/uuid"
)

type MessageRepoFake struct {
	messages map[string]string
	queueUrl string
}

func (s *MessageRepoFake) ReceiveMessages() ([]types.Message, error) {
	result := make([]types.Message, 0)
	for receiptHandle, message := range s.messages {
		result = append(result, types.Message{
			Body:          aws.String(message),
			ReceiptHandle: aws.String(receiptHandle),
		})
	}
	return result, nil
}

func (s *MessageRepoFake) MessagesInQueue() (int, error) {
	length := len(s.messages)
	return length, nil
}

func (s *MessageRepoFake) SendMessage(message string) error {
	s.messages[uuid.New().String()] = message
	return nil
}

func (s *MessageRepoFake) DeleteMessage(message types.Message) error {
	delete(s.messages, *message.ReceiptHandle)
	return nil
}

func (s *MessageRepoFake) QueueUrl() string {
	return s.queueUrl
}

func NewMessageRepoFake(queueUrl string) *MessageRepoFake {
	return &MessageRepoFake{
		messages: map[string]string{},
		queueUrl: queueUrl,
	}
}
