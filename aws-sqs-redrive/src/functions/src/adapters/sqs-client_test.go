package adapters

import (
	localstack "baracs/sqs-redrive/test"
	"context"
	"github.com/google/uuid"
	"testing"
)

func TestSqsClient_SendMessage(t *testing.T) {
	tests := []struct {
		name         string
		message      string
		wantErr      bool
		wantMessages []string
	}{
		{
			name:    "send message to queue",
			message: "asdf",
			wantErr: false,
			wantMessages: []string{
				"asdf",
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			queueUrl := localstack.CreateQueue(uuid.New().String())

			s := &SqsClient{
				client:   localstack.NewLocalStackClient().SqsClient,
				ctx:      context.TODO(),
				queueUrl: queueUrl,
			}
			if err := s.SendMessage(tt.message); (err != nil) != tt.wantErr {
				t.Errorf("SendMessage() error = %v, wantErr %v", err, tt.wantErr)
			}

			got := localstack.ReceiveMessages(queueUrl)

			if len(got) != len(tt.wantMessages) {
				t.Errorf("SendMessage() gotLength = %v, wantLength %v", len(got), len(tt.wantMessages))
			}

			localstack.DeleteQueue(queueUrl)
		})
	}
}

func TestSqsClient_MessagesInQueue(t *testing.T) {
	tests := []struct {
		name     string
		messages []string
		want     int
		wantErr  bool
	}{
		{
			name: "queue has messages",
			messages: []string{
				"asdf",
				"asdf",
			},
			want:    2,
			wantErr: false,
		},
		{
			name:     "queue has no messages",
			messages: []string{},
			want:     0,
			wantErr:  false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			queueUrl := localstack.CreateQueue(uuid.New().String())
			s := &SqsClient{
				client:   localstack.NewLocalStackClient().SqsClient,
				ctx:      context.TODO(),
				queueUrl: queueUrl,
			}

			for _, message := range tt.messages {
				_ = s.SendMessage(message)
			}

			got, err := s.MessagesInQueue()
			if (err != nil) != tt.wantErr {
				t.Errorf("MessagesInQueue() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("MessagesInQueue() got = %v, want %v", got, tt.want)
			}
		})
	}
}
