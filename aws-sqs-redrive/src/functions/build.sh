#!/usr/bin/env bash

set -euo pipefail

root=$PWD
src=$root/src/functions
functions=$(ls "$src"/handler)
mkdir -p "$root"/.build

export AWS_PROFILE=test
aws configure set aws_secret_access_key asdf
aws configure set aws_access_key_id asdf
aws configure set region eu-west-1

cd "$src"
go mod tidy
go test ./...

for f in $functions; do
  cd "$src"/handler/"$f"
  GOOS=linux go build "$f".go
  zip "$f".zip "$f"
  mv "$f".zip "$root"/.build/"$f".zip
  rm "$f"
done