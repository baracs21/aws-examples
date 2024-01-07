package usecases

import (
	localstack "baracs/sqs-redrive/test"
	"github.com/google/uuid"
	"testing"
)

func TestRedriveMessages_RedriveMessages(t *testing.T) {
	tests := []struct {
		name       string
		initSource []string
		wantTarget []string
		wantErr    bool
	}{
		{
			name: "move messages from source to target",
			initSource: []string{
				"asdf",
				"fdsa",
			},
			wantTarget: []string{
				"asdf",
				"fdsa",
			},
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := &RedriveMessages{
				source: localstack.NewMessageRepoFake(uuid.New().String()),
				target: localstack.NewMessageRepoFake(uuid.New().String()),
			}
			for _, m := range tt.initSource {
				_ = r.source.SendMessage(m)
			}

			if err := r.RedriveMessages(); (err != nil) != tt.wantErr {
				t.Errorf("RedriveMessages() error = %v, wantErr %v", err, tt.wantErr)
			}

			got, _ := r.target.ReceiveMessages()

			if len(got) != len(tt.wantTarget) {
				t.Errorf("RedriveMessages() gotLength = %v, wantLength %v", len(got), len(tt.wantTarget))
			}

			for _, message := range tt.wantTarget {
				found := false
				for _, gotMessage := range got {
					if message == *gotMessage.Body {
						found = true
					}
				}
				if !found {
					t.Errorf("RedriveMessages() %v not found in received messages", message)
				}
			}
		})
	}
}
