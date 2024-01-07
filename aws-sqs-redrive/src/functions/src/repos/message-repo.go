package repos

import "github.com/aws/aws-sdk-go-v2/service/sqs/types"

type MessageRepo interface {
	ReceiveMessages() ([]types.Message, error)
	SendMessage(message string) error
	DeleteMessage(message types.Message) error
	MessagesInQueue() (int, error)
	QueueUrl() string
}
