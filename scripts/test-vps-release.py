#!/usr/bin/env python3
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("portfolio_release", Path(__file__).with_name("deploy-vps-release.py"))
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)
REV = "a" * 40
NEW = "sha256:" + "1" * 64
OLD = "sha256:" + "2" * 64
MANIFEST = {"version": 1, "app": "samuel-homepage", "revision": REV, "images": {"app": {"tag": "samuel-homepage:git-" + REV, "id": NEW}}}


class ReleaseTests(unittest.TestCase):
    def test_manifest_binds_project_revision_service_tag_and_digest(self):
        self.assertEqual(release.validate_manifest(MANIFEST, REV)["id"], NEW)
        variants = []
        for key, value in [("app", "another-app"), ("revision", "b" * 40), ("version", 2), ("version", True), ("extra", "command")]:
            d = copy.deepcopy(MANIFEST)
            d[key] = value
            variants.append(d)
        d = copy.deepcopy(MANIFEST)
        d["images"]["db"] = dict(d["images"]["app"])
        variants.append(d)
        for key, value in [("tag", "another-app:latest"), ("id", "samuel-homepage:latest"), ("command", "arbitrary")]:
            d = copy.deepcopy(MANIFEST)
            d["images"]["app"][key] = value
            variants.append(d)
        for data in variants:
            with self.subTest(data=data):
                with self.assertRaises(ValueError):
                    release.validate_manifest(data, REV)

    def exercise(self, failure=None, existing=True, wrong_label=False, owned_network=True, rollback_failure=False):
        calls, states, persisted = [], [], []
        def run(args, image=None, check=True):
            calls.append((args, image))
            if args[:3] == ["docker", "image", "inspect"] and "--format" not in args:
                return subprocess.CompletedProcess(args, 0, json.dumps([{"Architecture": "amd64", "Os": "linux", "Config": {"Labels": {"org.opencontainers.image.revision": "b" * 40 if wrong_label else REV}}}]))
            if args[:3] == ["docker", "image", "inspect"]:
                return subprocess.CompletedProcess(args, 0, NEW)
            if args[:3] == ["docker", "network", "inspect"]:
                return subprocess.CompletedProcess(args, 0, json.dumps([{"Internal": True, "Labels": {"com.samuel-homepage.owner": "portfolio"} if owned_network else {}}]))
            if args[:3] == ["docker", "container", "inspect"]:
                return subprocess.CompletedProcess(args, 1, "")
            if args[:2] == ["docker", "inspect"]:
                return subprocess.CompletedProcess(args, 0, OLD)
            return subprocess.CompletedProcess(args, 0, "")
        def compose(args, image):
            calls.append((args, image))
            if args[0] == "ps":
                return subprocess.CompletedProcess(args, 0, "old-container" if existing else "")
            if args[0] == "up" and image == OLD and rollback_failure:
                raise RuntimeError("synthetic rollback failure")
            return subprocess.CompletedProcess(args, 0, "")
        probe_count = 0
        def probe(container):
            nonlocal probe_count
            probe_count += 1
            if failure == "canary" and container == release.CANARY or failure == "release" and probe_count == 2:
                raise RuntimeError("synthetic gate failure")
            return [{"status": 200}]
        with patch.object(release, "run", side_effect=run), patch.object(release, "compose", side_effect=compose), patch.object(release, "wait_health"), patch.object(release, "probe", side_effect=probe), patch.object(release, "save_state", side_effect=lambda state: states.append(copy.deepcopy(state))), patch.object(release, "persist_image", side_effect=persisted.append):
            if failure or wrong_label or not owned_network:
                with self.assertRaises((RuntimeError, ValueError)):
                    release.activate(REV, MANIFEST["images"]["app"])
            else:
                release.activate(REV, MANIFEST["images"]["app"])
        return calls, states, persisted

    def test_failed_canary_does_not_replace_healthy_application(self):
        calls, states, persisted = self.exercise(failure="canary")
        self.assertFalse(any(args[0] in ("up", "rm") for args, _ in calls))
        self.assertEqual(states[-1]["status"], "failed-before-replacement")
        self.assertEqual(persisted, [])

    def test_success_persists_only_verified_image_and_removes_canary(self):
        calls, states, persisted = self.exercise()
        self.assertEqual([image for args, image in calls if args[0] == "up"], [NEW])
        self.assertIn((["docker", "rm", "--force", release.CANARY], None), calls)
        self.assertEqual(states[-1]["status"], "healthy")
        self.assertEqual(states[-1]["previousImage"], OLD)
        self.assertEqual(persisted, [NEW])

    def test_failed_release_restores_previous_image(self):
        calls, states, persisted = self.exercise(failure="release")
        self.assertEqual([image for args, image in calls if args[0] == "up"], [NEW, OLD])
        self.assertEqual(states[-1]["status"], "failed-rolled-back")
        self.assertEqual(persisted, [OLD])

    def test_failed_first_release_removes_only_fixed_app(self):
        calls, states, persisted = self.exercise(failure="release", existing=False)
        self.assertIn((["rm", "--stop", "--force", "app"], NEW), calls)
        self.assertEqual(states[-1]["status"], "failed-rolled-back")
        self.assertEqual(persisted, [None])

    def test_failed_rollback_retains_explicit_recovery_state(self):
        _, states, _ = self.exercise(failure="release", rollback_failure=True)
        self.assertEqual(states[-1]["status"], "failed-rollback-unverified")

    def test_wrong_image_revision_cannot_start_a_container(self):
        calls, states, _ = self.exercise(wrong_label=True)
        self.assertFalse(any(args[0] == "up" or args[:2] == ["docker", "run"] for args, _ in calls))
        self.assertEqual(states, [])

    def test_unowned_network_cannot_be_used(self):
        calls, states, _ = self.exercise(owned_network=False)
        self.assertFalse(any(args[0] == "up" or args[:2] == ["docker", "run"] for args, _ in calls))
        self.assertEqual(states, [])

    def test_probe_rejects_nonportfolio_and_nonprivate_addresses(self):
        variants = [
            {"another_network": {"IPAddress": "172.24.0.2"}},
            {"portfolio_edge": {"IPAddress": "8.8.8.8"}},
            {"portfolio_edge": {"IPAddress": "127.0.0.1"}},
            {"portfolio_edge": {"IPAddress": "172.24.0.2"}, "extra_network": {}},
        ]
        for networks in variants:
            with self.subTest(networks=networks), patch.object(release, "run", return_value=subprocess.CompletedProcess([], 0, json.dumps(networks))), patch.object(release, "request") as request:
                with self.assertRaises(RuntimeError):
                    release.probe("samuel-homepage")
                request.assert_not_called()


if __name__ == "__main__":
    unittest.main()
