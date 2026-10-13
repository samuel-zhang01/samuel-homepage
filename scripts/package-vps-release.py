#!/usr/bin/env python3
"""Build and package exactly one reviewed portfolio image; no source/env payload."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import tarfile
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument("--revision", required=True)
parser.add_argument("--output", required=True)
args = parser.parse_args()
if not re.fullmatch(r"[0-9a-f]{40}", args.revision):
    raise SystemExit("Invalid revision")
head = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
if head != args.revision or subprocess.check_output(["git", "status", "--porcelain", "--untracked-files=normal"], text=True).strip():
    raise SystemExit("Packaging requires the exact clean checkout revision")
tag = "samuel-homepage:git-" + args.revision
subprocess.run(["docker", "build", "--platform", "linux/amd64", "--label", "org.opencontainers.image.revision=" + args.revision, "--tag", tag, "."], check=True)
image = json.loads(subprocess.check_output(["docker", "image", "inspect", tag], text=True))[0]
if image["Architecture"] != "amd64" or image["Os"] != "linux" or (image["Config"].get("Labels") or {}).get("org.opencontainers.image.revision") != args.revision:
    raise SystemExit("Built image does not match revision/architecture")
manifest = {"version": 1, "app": "samuel-homepage", "revision": args.revision, "images": {"app": {"tag": tag, "id": image["Id"]}}}
output = Path(args.output).resolve()
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix="portfolio-release-", dir=output.parent) as folder:
    folder = Path(folder)
    (folder / "manifest.json").write_text(json.dumps(manifest) + "\n")
    subprocess.run(["docker", "save", "--output", str(folder / "images.tar"), tag], check=True)
    with tarfile.open(output, "w") as archive:
        for name in ["manifest.json", "images.tar"]:
            archive.add(folder / name, arcname=name, recursive=False)
output.chmod(0o600)
print(json.dumps({"bundle": str(output), "manifest": manifest}))
