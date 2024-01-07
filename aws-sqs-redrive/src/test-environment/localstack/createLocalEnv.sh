#!/usr/bin/env bash

set -euo pipefail

SERVICES=$1

start_local_env() {
  docker-compose up -d &>/dev/null
}

wait_for_localstack() {
  for service in $SERVICES; do
    printf '%s...' "$service"
    while [ "$(curl -s http://localhost:4566/health | jq -r '.services | .'"$service"'')" != "running" ]; do
      printf .
      sleep 2
    done
    printf 'started.'
    echo ""
  done
}

start_local_env
wait_for_localstack
