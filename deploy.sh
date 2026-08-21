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
homepage_public_origin="${homepage_public_origin%/}"

if [[ "$homepage_public_origin" != "https://me.samuelzhang.co.uk" ]]; then
  echo "HOMEPAGE_PUBLIC_ORIGIN must be the canonical HTTPS origin: https://me.samuelzhang.co.uk" >&2
  exit 1
fi

if [[ ! "$homepage_port" =~ ^[0-9]+$ ]] || (( homepage_port < 1 || homepage_port > 65535 )); then
  echo "HOMEPAGE_PORT must be an integer from 1 to 65535." >&2
  exit 1
fi

public_host="me.samuelzhang.co.uk"

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

echo "Checking dependencies, source boundaries, catalogue metadata and project styles..."
npm run audit:dependencies
npm run lint
npm run check:artifacts
npm run check:data
npm run check:catalogue
npm run check:styles
npm run check:locales

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

      response_headers=$(docker exec "$container_id" wget --server-response --tries=1 --spider \
        --header="Host: ${public_host}" http://127.0.0.1:3000 2>&1)
      for required_header in \
        content-security-policy \
        cross-origin-opener-policy \
        cross-origin-resource-policy \
        strict-transport-security \
        x-content-type-options \
        x-frame-options; do
        if ! grep -Eiq "^[[:space:]]*${required_header}:" <<<"$response_headers"; then
          echo "The production response is missing ${required_header}." >&2
          exit 1
        fi
      done
      if grep -Ei "^[[:space:]]*content-security-policy:" <<<"$response_headers" | grep -Fq "'unsafe-eval'"; then
        echo "The production CSP unexpectedly permits unsafe-eval." >&2
        exit 1
      fi

      rejected_host_response=$(docker exec "$container_id" wget --server-response --tries=1 --spider \
        --header="Host: untrusted.invalid" http://127.0.0.1:3000 2>&1 || true)
      if ! grep -Eq "HTTP/[0-9.]+ 421" <<<"$rejected_host_response"; then
        echo "The production server did not reject an untrusted Host header with HTTP 421." >&2
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
        public_navigation=$(curl --fail --silent --show-error --head --location \
          --proto "=https" --proto-redir "=https" --tlsv1.2 \
          --max-redirs 3 --max-time 20 --retry 3 --retry-delay 2 \
          --output /dev/null \
          --write-out $'__EFFECTIVE_URL__:%{url_effective}\n' "$homepage_public_origin")
        effective_url=$(sed -n 's/^__EFFECTIVE_URL__://p' <<<"$public_navigation" | tail -n 1)
        case "$effective_url" in
          "$homepage_public_origin"|"$homepage_public_origin"/*) ;;
          *)
            echo "The public route left the canonical HTTPS origin: ${effective_url}" >&2
            exit 1
            ;;
        esac
        # Validate a fresh, non-following response from the resolved endpoint.
        # This prevents a header on an intermediate redirect from satisfying
        # (or poisoning) the final production security-header check.
        public_probe=$(curl --fail --silent --show-error --head \
          --proto "=https" --tlsv1.2 --max-time 20 --retry 3 --retry-delay 2 \
          --write-out $'\n__HTTP_CODE__:%{http_code}\n' "$effective_url")
        final_status=$(sed -n 's/^__HTTP_CODE__://p' <<<"$public_probe" | tail -n 1)
        if [[ "$final_status" != 2* ]]; then
          echo "The canonical public endpoint returned HTTP ${final_status}." >&2
          exit 1
        fi
        for required_header in \
          content-security-policy \
          cross-origin-opener-policy \
          cross-origin-resource-policy \
          strict-transport-security \
          x-content-type-options \
          x-frame-options; do
          if ! grep -Eiq "^${required_header}:" <<<"$public_probe"; then
            echo "The public HTTPS response is missing ${required_header}." >&2
            exit 1
          fi
        done
        if grep -Ei "^content-security-policy:" <<<"$public_probe" | grep -Fq "'unsafe-eval'"; then
          echo "The public production CSP unexpectedly permits unsafe-eval." >&2
          exit 1
        fi
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
