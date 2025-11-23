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
  -u "${RAMP_USERS:-200}" \
  -r "${RAMP_SPAWN_RATE:-20}" \
  -t "${RAMP_DURATION:-15m}" \
  --csv "load_testing/locust_ecs/results/locust_ramp"
