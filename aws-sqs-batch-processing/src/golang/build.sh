#!/usr/bin/env bash

set -euxo pipefail

root=$PWD
functions=$(ls handler)
mkdir -p "$root"/build

for f in $functions; do
  cd "$root"/handler/"$f"
  GOOS=linux go build "$f".go
  zip "$f".zip "$f"
  mv "$f".zip "$root"/build/"$f".zip
  rm "$f"
done
