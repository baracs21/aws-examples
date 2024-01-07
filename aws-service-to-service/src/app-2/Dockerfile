############################
# STEP 1 build executable binary
############################
FROM golang:1.17-alpine AS builder

# Install git.
# Git is required for fetching the dependencies.
RUN apk update && apk add --no-cache curl

WORKDIR /workdir

COPY . .

#RUN go mod download
#RUN go mod verify

RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -a -installsuffix cgo -o /workdir/app .

############################
# STEP 2 build the image
############################
FROM public.ecr.aws/lts/ubuntu:latest

RUN apt update && apt install curl -y

# Copy our static executable.
COPY --from=builder /workdir/app /go/bin/app

EXPOSE 8080

CMD ["/go/bin/app"]