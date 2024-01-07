package usecases

import (
	"baracs/sqs-redrive/src/repos"
	"log"
)

type RedriveMessagesContext struct {
	Source repos.MessageRepo
	Target repos.MessageRepo
}

type RedriveMessages struct {
	source repos.MessageRepo
	target repos.MessageRepo
}

func (r *RedriveMessages) RedriveMessages() error {
	messageCount, err := r.source.MessagesInQueue()

	if err != nil {
		return err
	}
	log.Printf("Approximate number of messages in Dlq: %d", messageCount)

	messages, err := r.source.ReceiveMessages()

	for len(messages) > 0 {
		if err != nil {
			log.Printf("Can not receive messages from source queue: %s, err: %s", r.source.QueueUrl(), err)
			return err
		}
		for _, message := range messages {
			err := r.target.SendMessage(*message.Body)
			if err != nil {
				log.Printf("Can not send message to target queue: %s, err: %s", r.target.QueueUrl(), err)
				continue
			}

			err = r.source.DeleteMessage(message)
			if err != nil {
				log.Printf("Can not delete message from source queue: %s, err: %s", r.source.QueueUrl(), err)
			}

			log.Printf("Message: %s, successful send to source queue", *message.Body)
		}
		messages, err = r.source.ReceiveMessages()
	}

	return nil
}

func NewRedriveMessagesUseCase(ctx RedriveMessagesContext) *RedriveMessages {
	return &RedriveMessages{
		source: ctx.Source,
		target: ctx.Target,
	}
}
