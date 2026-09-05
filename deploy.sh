#!/usr/bin/env bash

set -euo pipefail

# Work from the checkout, even when launched from another directory.
deployment_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$deployment_dir"
case "${1:-}" in
  "") sync_checkout=1 ;;
  --local) sync_checkout=0 ;;
  --help|-h)
    echo "Usage: ./deploy.sh [--local]"
    echo "Default: fast-forward origin/main, install locked dependencies, check, build and deploy."
    echo "--local: deploy the current clean checkout without fetching."
    exit 0 ;;
  *) echo "Unknown option: $1. Use --help." >&2; exit 1 ;;
esac
if (( $# > 1 )); then
  echo "Expected at most one option. Use --help." >&2
  exit 1
fi
for required_command in git node npm docker; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    echo "$required_command is required but was not found." >&2
    exit 1
  fi
done
node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (major < 20 || (major === 20 && minor < 16)) { console.error("Node.js 20.16 or newer is required."); process.exit(1); }'
if [[ "$(git rev-parse --show-toplevel)" != "$deployment_dir" ]]; then
  echo "deploy.sh must be in the root of its Git checkout." >&2
  exit 1
fi
if [[ -n "$(git status --porcelain --untracked-files=normal)" ]]; then
  echo "The checkout has local changes. Commit or move them before deploying; nothing was overwritten." >&2
  exit 1
fi
docker info >/dev/null
if (( sync_checkout == 1 )); then
  if [[ "$(git symbolic-ref --short -q HEAD)" != "main" ]]; then
    echo "Automatic deployment requires branch main. Use --local for a reviewed clean revision." >&2
    exit 1
  fi
  echo "Fetching the latest origin/main..."
  git fetch origin main
  if ! git merge-base --is-ancestor HEAD origin/main; then
    echo "Local main is ahead of or diverged from origin/main; refusing to overwrite it." >&2
    exit 1
  fi
  git merge --ff-only origin/main
  # Run the newly fetched script, not the old shell's already loaded instructions.
  exec bash "$deployment_dir/deploy.sh" --local
fi
echo "Deploying revision $(git rev-parse --short HEAD)"

service_name="samuel-homepage"
deployment_image="samuel-homepage:production"

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

"${compose[@]}" config --quiet

echo "Installing locked dependencies (including build and verification tools)..."
npm ci --include=dev --no-fund --no-audit

if ! previous_container_id=$("${compose[@]}" ps -q "$service_name"); then
  echo "Could not inspect the existing service; refusing to replace it without a rollback target." >&2
  exit 1
fi
previous_image=""
if [[ -n "$previous_container_id" ]]; then
  if ! previous_image=$(docker inspect --format '{{.Image}}' "$previous_container_id") || [[ -z "$previous_image" ]]; then
    echo "Could not resolve the previous image; the existing service was not replaced." >&2
    exit 1
  fi
fi
replacement_started=0
deployment_verified=0

rollback_on_failure() {
  status=$?
  trap - EXIT
  if (( status != 0 && replacement_started == 1 && deployment_verified == 0 )) && [[ -n "$previous_image" ]]; then
    echo "Deployment verification failed; restoring the previous image..." >&2
    if docker tag "$previous_image" "$deployment_image" \
      && "${compose[@]}" up -d --no-build --force-recreate "$service_name"; then
      echo "Previous production image restored. Inspect its health before retrying." >&2
    else
      echo "Automatic rollback failed; inspect Compose and image ${previous_image}." >&2
    fi
  elif (( status != 0 && replacement_started == 1 && deployment_verified == 0 )); then
    echo "Deployment verification failed with no previous image; removing the failed first deployment..." >&2
    "${compose[@]}" rm --stop --force "$service_name" >/dev/null 2>&1 || true
  fi
  exit "$status"
}
trap rollback_on_failure EXIT

echo "Checking dependencies, source boundaries, catalogue metadata and project styles..."
npm run audit:dependencies
npm run lint
npm run check:artifacts
npm run check:data
npm run check:catalogue
npm run check:styles
npm run check:locales
npm run check:desk
npm run check:controls
npm run check:orbitals
npm run prepare:search
npm run check:search
npm run check:finder

echo "Building Samuel System 7..."
"${compose[@]}" build "$service_name"

echo "Starting the verified image candidate..."
replacement_started=1
"${compose[@]}" up -d --no-build "$service_name"

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
      for required_route in / /desk /projects /sidequest /en-gb/desk /orbitals /en-gb/orbitals /en-us/orbitals /zh-cn/orbitals /zh-tw/orbitals; do
        if ! docker exec "$container_id" wget --no-verbose --tries=1 --spider \
          --header="Host: ${public_host}" "http://127.0.0.1:3000${required_route}" >/dev/null; then
          echo "The container is healthy but failed the canonical ${required_route} route probe." >&2
          exit 1
        fi
      done

      missing_route_response=$(docker exec "$container_id" wget --server-response --tries=1 --spider \
        --header="Host: ${public_host}" http://127.0.0.1:3000/__finder_missing_item__ 2>&1 || true)
      if ! grep -Eq "HTTP/[0-9.]+ 404" <<<"$missing_route_response"; then
        echo "The production server did not preserve HTTP 404 for an unknown route." >&2
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
        for required_route in /desk /projects /sidequest /en-gb/desk /orbitals /en-gb/orbitals /en-us/orbitals /zh-cn/orbitals /zh-tw/orbitals; do
          route_probe=$(curl --silent --show-error --head --location \
            --proto "=https" --proto-redir "=https" --tlsv1.2 \
            --max-redirs 3 --max-time 20 --retry 3 --retry-delay 2 \
            --output /dev/null --write-out $'__HTTP_CODE__:%{http_code}\n__EFFECTIVE_URL__:%{url_effective}\n' \
            "${homepage_public_origin}${required_route}")
          route_status=$(sed -n 's/^__HTTP_CODE__://p' <<<"$route_probe" | tail -n 1)
          route_url=$(sed -n 's/^__EFFECTIVE_URL__://p' <<<"$route_probe" | tail -n 1)
          case "$route_url" in
            "$homepage_public_origin"|"$homepage_public_origin"/*) ;;
            *) echo "The public ${required_route} route left the canonical HTTPS origin." >&2; exit 1 ;;
          esac
          if [[ "$route_status" != 2* ]]; then
            echo "The public ${required_route} route returned HTTP ${route_status}." >&2
            exit 1
          fi
        done
        echo "Public HTTPS origin is responding."
      else
        echo "Set VERIFY_PUBLIC_ORIGIN=1 to verify the public HTTPS route after proxy/DNS changes."
      fi
      deployment_verified=1
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
