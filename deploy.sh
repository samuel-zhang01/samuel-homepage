#!/usr/bin/env bash

set -euo pipefail

service_name="samuel-homepage"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but was not found." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  compose=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  compose=(docker-compose)
else
  echo "Docker Compose is required but was not found." >&2
  exit 1
fi

echo "Checking reviewed public artifacts, catalogue metadata and project styles..."
npm run check:artifacts
npm run check:catalogue
npm run check:styles

echo "Building and starting Samuel System 7..."
"${compose[@]}" up -d --build "$service_name"

container_id=$("${compose[@]}" ps -q "$service_name")
if [[ -z "$container_id" ]]; then
  echo "Compose did not return a container for $service_name." >&2
  "${compose[@]}" ps
  exit 1
fi

echo "Waiting for the application health check..."
for _ in {1..45}; do
  health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id")
  case "$health" in
    healthy)
      echo "Samuel System 7 is ready at http://localhost:${HOMEPAGE_PORT:-5174}"
      echo "LAN: http://<machine-ip>:${HOMEPAGE_PORT:-5174}"
      exit 0
      ;;
    unhealthy|exited|dead)
      echo "Container entered the '$health' state." >&2
      "${compose[@]}" logs --tail=100 "$service_name" >&2
      exit 1
      ;;
  esac
  sleep 2
done

echo "The container did not become healthy within 90 seconds." >&2
"${compose[@]}" logs --tail=100 "$service_name" >&2
exit 1
