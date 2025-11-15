#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

export LOCUST_MIN_WAIT="${LOCUST_MIN_WAIT:-0.02}"
export LOCUST_MAX_WAIT="${LOCUST_MAX_WAIT:-0.05}"

locust -f load_testing/locust_sqs/worker_sqs_locust.py \
  --headless \
  -u "${SOAK_USERS:-120}" \
  -r "${SOAK_SPAWN_RATE:-10}" \
  -t "${SOAK_DURATION:-45m}" \
  --csv "load_testing/locust_sqs/results/locust_soak"
