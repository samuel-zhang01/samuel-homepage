#!/usr/bin/env python3
"""Fixed host-side portfolio activation; never execute source from a bundle."""
import fcntl
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import time
import urllib.error
import urllib.request

BASE = Path("/root/production/samuel-homepage")
COMPOSE = BASE / "compose.vps.yml"
ENV = {"PATH": "/usr/sbin:/usr/bin:/sbin:/bin", "HOME": "/root"}
CANARY = "samuel-homepage-canary"


def validate_manifest(data, revision):
    if not re.fullmatch(r"[0-9a-f]{40}", revision):
        raise ValueError("Invalid revision")
    if set(data) != {"version", "app", "revision", "images"}:
        raise ValueError("Unexpected manifest fields")
    if type(data["version"]) is not int or data["version"] != 1 or data["app"] != "samuel-homepage" or data["revision"] != revision:
        raise ValueError("Manifest scope/revision mismatch")
    if not isinstance(data["images"], dict) or set(data["images"]) != {"app"}:
        raise ValueError("Only the portfolio app image is permitted")
    image = data["images"]["app"]
    if not isinstance(image, dict) or set(image) != {"tag", "id"}:
        raise ValueError("Invalid image fields")
    if image["tag"] != "samuel-homepage:git-" + revision:
        raise ValueError("Invalid image tag")
    if not isinstance(image["id"], str) or not re.fullmatch(r"sha256:[0-9a-f]{64}", image["id"]):
        raise ValueError("Invalid immutable image ID")
    return image


def run(args, image=None, check=True):
    env = dict(ENV)
    if image:
        env["PORTFOLIO_IMAGE"] = image
    return subprocess.run(args, env=env, check=check, capture_output=True, text=True)


def compose(args, image):
    return run(["docker", "compose", "--project-name", "samuel-homepage", "--file", str(COMPOSE), *args], image)


def wait_health(container):
    for _ in range(45):
        state = json.loads(run(["docker", "inspect", "--format", "{{json .State}}", container]).stdout)
        if state.get("Status") in ("exited", "dead") or (state.get("Health") or {}).get("Status") == "unhealthy":
            raise RuntimeError("Portfolio container failed health check")
        if (state.get("Health") or {}).get("Status") == "healthy":
            return
        time.sleep(2)
    raise RuntimeError("Portfolio health check timed out")


def request(address, path, host="localhost"):
    req = urllib.request.Request(f"http://{address}:3000{path}", headers={"Host": host, "User-Agent": "PortfolioReleaseGate/1.0"})
    try:
        response = urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req, timeout=15)
    except urllib.error.HTTPError as response:
        body = response.read(4 * 1024 * 1024 + 1)
        return response.code, dict(response.headers.items()), body
    with response:
        return response.status, dict(response.headers.items()), response.read(4 * 1024 * 1024 + 1)


def probe(container):
    networks = json.loads(run(["docker", "inspect", "--format", "{{json .NetworkSettings.Networks}}", container]).stdout)
    if set(networks) != {"portfolio_edge"}:
        raise RuntimeError("Portfolio container has unexpected network attachments")
    address = networks["portfolio_edge"]["IPAddress"]
    parsed = ipaddress.ip_address(address)
    if parsed.version != 4 or not parsed.is_private or parsed.is_loopback or parsed.is_unspecified:
        raise RuntimeError("Portfolio bridge address is invalid")
    cases = [("/", 200, "localhost"), ("/orbitals", 200, "localhost"), ("/__portfolio_release_missing__", 404, "localhost"),
             ("/", 421, "untrusted.invalid"), ("/_next/image?url=%2Fheadshot.jpg&w=256&q=75", 200, "localhost"),
             ("/_next/image?url=%2Fheadshot.jpg%3Fsecurity_probe%3D1&w=256&q=75", 400, "localhost")]
    checks = []
    for path, expected, host in cases:
        status, headers, body = request(address, path, host)
        if status != expected:
            raise RuntimeError(f"Portfolio gate failed: {path} expected {expected}, received {status}")
        if path == "/" and host == "localhost":
            lower = {k.lower(): v for k, v in headers.items()}
            if lower.get("x-content-type-options") != "nosniff" or lower.get("x-frame-options") != "DENY" or not lower.get("content-security-policy"):
                raise RuntimeError("Portfolio security headers are missing")
        checks.append({"path": path, "host": host, "status": status, "responseBytes": len(body)})
    status, _, body = request(address, "/headshot.jpg")
    expected = run(["docker", "exec", container, "sha256sum", "/app/public/headshot.jpg"]).stdout.split()[0]
    if status != 200 or hashlib.sha256(body).hexdigest() != expected:
        raise RuntimeError("Portfolio public artifact hash mismatch")
    checks.append({"path": "/headshot.jpg", "status": status, "sha256": expected})
    return checks


def save_state(state):
    temp = BASE / ".release-state.tmp"
    temp.write_text(json.dumps(state, indent=2) + "\n")
    temp.chmod(0o600)
    temp.replace(BASE / "release-state.json")


def persist_image(image):
    path = BASE / ".env"
    if image is None:
        path.unlink(missing_ok=True)
        return
    temp = BASE / ".image-selection.tmp"
    temp.write_text("PORTFOLIO_IMAGE=" + image + "\n")
    temp.chmod(0o600)
    temp.replace(path)


def activate(revision, image):
    metadata = json.loads(run(["docker", "image", "inspect", image["id"]]).stdout)[0]
    label = (metadata.get("Config", {}).get("Labels") or {}).get("org.opencontainers.image.revision")
    if metadata["Architecture"] != "amd64" or metadata["Os"] != "linux" or label != revision:
        raise ValueError("Image architecture/revision mismatch")
    if run(["docker", "image", "inspect", "--format", "{{.Id}}", image["tag"]]).stdout.strip() != image["id"]:
        raise ValueError("Image tag does not match manifest ID")
    compose(["config", "--quiet"], image["id"])
    old = compose(["ps", "--all", "--quiet", "app"], image["id"]).stdout.strip()
    previous = run(["docker", "inspect", "--format", "{{.Image}}", old]).stdout.strip() if old else None
    state = {"revision": revision, "image": image, "previousImage": previous, "status": "checking", "canaryChecks": []}
    # Create only our fixed internal network; NPM connection is coordinator-owned.
    network = run(["docker", "network", "inspect", "portfolio_edge"], check=False)
    if network.returncode:
        run(["docker", "network", "create", "--internal", "--label", "com.samuel-homepage.owner=portfolio", "portfolio_edge"])
    else:
        existing_network = json.loads(network.stdout)[0]
        if not existing_network.get("Internal") or (existing_network.get("Labels") or {}).get("com.samuel-homepage.owner") != "portfolio":
            raise ValueError("Portfolio edge network must be our owned internal network")
    if run(["docker", "container", "inspect", CANARY], check=False).returncode == 0:
        raise RuntimeError("Existing portfolio canary requires operator review")
    started = False
    replaced = False
    try:
        run(["docker", "run", "--detach", "--name", CANARY, "--network", "portfolio_edge",
             "--init", "--user", "1001:1001", "--read-only", "--tmpfs", "/tmp:size=32m,noexec,nosuid,nodev", "--tmpfs", "/app/.next/cache:size=128m,uid=1001,gid=1001,mode=0700,noexec,nosuid,nodev",
             "--security-opt", "no-new-privileges:true", "--cap-drop", "ALL", "--pids-limit", "100", "--memory", "512m", "--cpus", "0.5", image["id"]])
        started = True
        wait_health(CANARY)
        state["canaryChecks"] = probe(CANARY)
        replaced = True
        compose(["up", "--detach", "--no-build", "--no-deps", "app"], image["id"])
        wait_health("samuel-homepage")
        state["releaseChecks"] = probe("samuel-homepage")
        state["status"] = "healthy"
        persist_image(image["id"])
        save_state(state)
        print(json.dumps(state))
    except Exception as error:
        state["failureType"] = type(error).__name__
        try:
            if replaced:
                if previous:
                    compose(["up", "--detach", "--no-build", "--no-deps", "app"], previous)
                    wait_health("samuel-homepage")
                    probe("samuel-homepage")
                else:
                    compose(["rm", "--stop", "--force", "app"], image["id"])
                persist_image(previous)
            state["status"] = "failed-rolled-back" if replaced else "failed-before-replacement"
        except Exception as rollback_error:
            state["status"] = "failed-rollback-unverified"
            state["rollbackFailureType"] = type(rollback_error).__name__
            raise RuntimeError("Portfolio rollback requires operator recovery") from rollback_error
        finally:
            save_state(state)
        raise
    finally:
        if started:
            run(["docker", "rm", "--force", CANARY], check=False)


def main():
    if len(sys.argv) != 3 or os.geteuid() != 0:
        raise SystemExit("Usage (root): deploy-release REVISION VALIDATED_MANIFEST_PATH")
    path = Path(sys.argv[2])
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o022:
        raise ValueError("Manifest must be a root-owned regular file, not writable by other users")
    data = json.loads(path.read_text())
    image = validate_manifest(data, sys.argv[1])
    with (BASE / ".deploy.lock").open("a") as lock:
        os.chmod(lock.name, 0o600)
        fcntl.flock(lock, fcntl.LOCK_EX)
        activate(sys.argv[1], image)


if __name__ == "__main__":
    main()
