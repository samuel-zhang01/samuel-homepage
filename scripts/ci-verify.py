#!/usr/bin/env python3
"""Run maintained checks against an owned loopback preview; retain QA receipts."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tarfile
import tempfile
import time
import urllib.request


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--engines", default="chromium")
    args = parser.parse_args()
    engines = args.engines.split(",")
    if not engines or len(set(engines)) != len(engines) or any(e not in {"chromium", "firefox", "webkit"} for e in engines):
        parser.error("Use unique chromium,firefox,webkit engines")
    root = Path(__file__).resolve().parent.parent
    os.chdir(root)
    env = os.environ.copy()
    if not env.get("PLAYWRIGHT_CORE_PATH") or not env.get("ESBUILD_PATH"):
        parser.error("Provide external PLAYWRIGHT_CORE_PATH and ESBUILD_PATH")
    # A previous shell's coverage filters must never silently narrow CI scope.
    for key in list(env):
        if key.startswith(("DEEP_", "PHONE_SPACE_", "PROJECT_RESIZE_", "ICON_", "AXE_")) or key in {"REVIEW_GROUP", "LOCALE_PATTERN", "BROWSER_EXECUTABLE_PATH", "REVIEW_ORIGIN"}:
            env.pop(key)
    identifier = f"{env.get('GITHUB_SHA', 'local')}-{env.get('GITHUB_RUN_ID', str(time.time_ns()))}-{env.get('GITHUB_RUN_ATTEMPT', '1')}"
    reports = root / ".codex" / "reports" / ("ci-" + identifier)
    reports.mkdir(parents=True, exist_ok=False)
    results = {"engines": engines, "scope": "All maintained npm check families; default locale/width/project matrices", "checks": []}
    server = None

    def check(name, command):
        print(f"CI gate: {name}", flush=True)
        with (reports / (name + ".log")).open("w") as log:
            process = subprocess.Popen(command, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            for line in process.stdout:
                log.write(line)
                print(line, end="", flush=True)
            code = process.wait()
        results["checks"].append({"name": name, "exitCode": code})
        if code:
            raise subprocess.CalledProcessError(code, command)

    try:
        check("release", ["npm", "run", "check:release"])
        check("inventory", ["npm", "run", "audit:repository"])
        check("vps-helper", ["python3", "scripts/test-vps-release.py"])
        with tempfile.TemporaryDirectory(prefix="portfolio-ci-preview-", dir=env.get("RUNNER_TEMP")) as directory:
            preview = Path(directory)
            shutil.copytree(root / ".next-build" / "standalone", preview, dirs_exist_ok=True)
            shutil.copytree(root / ".next-build" / "static", preview / ".next-build" / "static")
            shutil.copy2(root / ".next-build" / "react-loadable-manifest.json", preview / ".next-build")
            shutil.copytree(root / "public", preview / "public")
            with socket.socket() as sock:
                sock.bind(("127.0.0.1", 0))
                port = sock.getsockname()[1]
            env["REVIEW_ORIGIN"] = f"http://127.0.0.1:{port}"
            server_env = {**env, "HOSTNAME": "127.0.0.1", "PORT": str(port), "NODE_ENV": "production"}
            with (reports / "preview.log").open("w") as server_log:
                server = subprocess.Popen(["node", "server.js"], cwd=preview, env=server_env, stdout=server_log, stderr=subprocess.STDOUT)
                opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
                for _ in range(90):
                    if server.poll() is not None:
                        raise RuntimeError("Owned preview exited before readiness")
                    try:
                        with opener.open(env["REVIEW_ORIGIN"] + "/", timeout=2) as response:
                            if response.status == 200:
                                break
                    except OSError:
                        time.sleep(1)
                else:
                    raise RuntimeError("Owned preview readiness timed out")
                results["origin"] = env["REVIEW_ORIGIN"]
                env["DEEP_REPORT_DIR"] = str(reports / "http")
                check("http", ["npm", "run", "check:deep:http"])
                for engine in engines:
                    env.update({"BROWSER_ENGINE": engine, "DEEP_REPORT_DIR": str(reports / engine), "REVIEW_SCREENSHOT_DIR": str(reports / engine / "screenshots"), "PHONE_SPACE_REPORT_DIR": str(reports / engine / "phone"), "PROJECT_RESIZE_REPORT_DIR": str(reports / engine / "resize"), "PROJECT_RESIZE_ENGINES": engine})
                    for name in ["check:deep:browser", "check:deep:recovery", "check:resize", "check:phone-space"]:
                        check(engine + "-" + name.replace(":", "-"), ["npm", "run", name])
                server.terminate()
                server.wait(timeout=10)
                server = None
        results["status"] = "passed"
    finally:
        if server is not None:
            server.terminate()
            try:
                server.wait(timeout=10)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()
        results.setdefault("status", "failed")
        (reports / "ci-summary.json").write_text(json.dumps(results, indent=2) + "\n")
        archive_dir = Path.home() / ".local" / "share" / "samuel-homepage" / "review-archive"
        archive_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
        archive = archive_dir / ("ci-" + identifier + ".tar.gz")
        members = {str(path.relative_to(reports)): hashlib.sha256(path.read_bytes()).hexdigest() for path in reports.rglob("*") if path.is_file()}
        with tarfile.open(archive, "w:gz") as output:
            output.add(reports, arcname="reports")
        archive.chmod(0o600)
        with tarfile.open(archive, "r:gz") as saved:
            for name, digest in members.items():
                if hashlib.sha256(saved.extractfile("reports/" + name).read()).hexdigest() != digest:
                    raise RuntimeError("QA archive verification failed")
        manifest = archive.with_suffix(".manifest.json")
        manifest.write_text(json.dumps({"archive": str(archive), "sha256": hashlib.sha256(archive.read_bytes()).hexdigest(), "members": members, "summary": results}, indent=2) + "\n")
        manifest.chmod(0o600)
        shutil.rmtree(reports)
        print(json.dumps({"archive": str(archive), "manifest": str(manifest), "status": results["status"]}), flush=True)


if __name__ == "__main__":
    main()
