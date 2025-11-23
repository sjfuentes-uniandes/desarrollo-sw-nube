#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

locust -f load_testing/locust_ecs/worker_sqs_locust.py \
  --headless \
  -u "${LOCUST_USERS:-10}" \
  -r "${LOCUST_SPAWN_RATE:-5}" \
  -t "${SMOKE_DURATION:-5m}" \
  --only-summary
