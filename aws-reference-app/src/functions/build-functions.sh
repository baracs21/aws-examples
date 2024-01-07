#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR=$1
BUILD_DIR=$ROOT_DIR/build/functions

HANDLER_DIR=$PWD/handler
HANDLER=$(ls -l $HANDLER_DIR | grep '^d' | awk '{print $NF}')

mkdir -p $BUILD_DIR

for handler in $HANDLER; do
  echo "Building $handler"
  cd $HANDLER_DIR/$handler
  main=$(ls -1 *.go)
  GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap -tags lambda.norpc $main
  zip ${handler}.zip bootstrap
  rm bootstrap
  mv ${handler}.zip $BUILD_DIR
done