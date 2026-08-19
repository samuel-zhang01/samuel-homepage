#!/usr/bin/env bash

set -euo pipefail

service_name="samuel-homepage"

# Docker Compose reads .env itself, but this script also needs the harmless
# endpoint values for its post-deploy probes. Parse only the allowlisted keys;
# do not source the file as shell code.
if [[ -f .env ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    case "$line" in
      ""|\#*) continue ;;
    esac

    key="${line%%=*}"
    value="${line#*=}"
    case "$key" in
      HOMEPAGE_BIND_ADDRESS|HOMEPAGE_PORT|HOMEPAGE_PUBLIC_ORIGIN|VERIFY_PUBLIC_ORIGIN)
        export "$key=$value"
        ;;
    esac
  done < .env
fi

homepage_bind_address="${HOMEPAGE_BIND_ADDRESS:-0.0.0.0}"
homepage_port="${HOMEPAGE_PORT:-5174}"
homepage_public_origin="${HOMEPAGE_PUBLIC_ORIGIN:-https://me.samuelzhang.co.uk}"

if [[ "$homepage_public_origin" != https://* ]]; then
  echo "HOMEPAGE_PUBLIC_ORIGIN must be an HTTPS URL." >&2
  exit 1
fi

public_host="${homepage_public_origin#https://}"
public_host="${public_host%%/*}"
if [[ -z "$public_host" || "$public_host" == *[[:space:]]* ]]; then
  echo "HOMEPAGE_PUBLIC_ORIGIN must contain a hostname." >&2
  exit 1
fi

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
      if ! docker exec "$container_id" wget --no-verbose --tries=1 --spider \
        --header="Host: ${public_host}" http://127.0.0.1:3000 >/dev/null; then
        echo "The container is healthy but rejected the canonical host probe." >&2
        exit 1
      fi

      echo "Samuel System 7 is ready on ${homepage_bind_address}:${homepage_port}"
      echo "LAN: http://<machine-ip>:${homepage_port}"
      echo "HTTPS reverse-proxy origin: ${homepage_public_origin}"
      if [[ "${VERIFY_PUBLIC_ORIGIN:-0}" == "1" ]]; then
        if ! command -v curl >/dev/null 2>&1; then
          echo "curl is required when VERIFY_PUBLIC_ORIGIN=1." >&2
          exit 1
        fi
        echo "Verifying the public HTTPS origin..."
        curl --fail --silent --show-error --location --max-time 20 --retry 3 --retry-delay 2 \
          "$homepage_public_origin" >/dev/null
        echo "Public HTTPS origin is responding."
      else
        echo "Set VERIFY_PUBLIC_ORIGIN=1 to verify the public HTTPS route after proxy/DNS changes."
      fi
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
