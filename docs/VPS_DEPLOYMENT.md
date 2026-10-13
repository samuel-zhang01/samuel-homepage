# Portfolio VPS deployment

The portable portfolio runs from an immutable AMD64 image. It has no server database, persistent uploads or private runtime environment. Browser-local tools retain their existing behavior. Build inputs come from the exact reviewed Git revision; credentials, source archives and database exports are excluded from the release bundle.

`.github/workflows/deploy-vps.yml` runs on a trusted push to `main`, or a manual dispatch whose selected ref is `main`. It uses only the dedicated `deploy-vps` and `portfolio` runner labels and the `vps-production` environment, whose branch policy allows `main`. Pull-request validation stays on hosted runners. The public repository requires approval for all external fork contributors; runner labels alone do not authorize code.

The workflow verifies the activation-helper regressions, builds the pinned Dockerfile on AMD64, and packages only `manifest.json` and `images.tar`. The manifest binds `samuel-homepage`, the exact 40-character Git revision, one `app` image, its revision-specific tag and its immutable Docker image ID. `scripts/package-vps-release.py` refuses a dirty checkout or a revision different from `HEAD`. `actions/checkout` is pinned to the reviewed v7.0.1 commit with persisted Git credentials disabled.

`VPS_DEPLOY_KEY` and `VPS_DEPLOY_KNOWN_HOSTS` are environment secrets. The key permits only the fixed portfolio receiver command `deploy REVISION`; it grants no shell, forwarding or PTY. The workflow creates private temporary transport files and removes them after use. The receiver validates the archive and image identity before invoking the separately installed, root-owned helper at `/root/production/samuel-homepage/bin/deploy-release`. A release cannot activate until the coordinator creates the host's `.migration-active` marker after migration acceptance. CI does not install or replace host activation code or Compose configuration.

## Host activation and rollback

The reviewed host helper is `scripts/deploy-vps-release.py`; its fixed host configuration is `deploy/compose.vps.yml`. The helper runs only the `app` service in the fixed `samuel-homepage` project. The app runs as UID/GID 1001, with a read-only root filesystem, no Linux capabilities, `no-new-privileges`, bounded temporary/cache files, 512 MiB memory, half a CPU and 100 processes. Application logs rotate at three files of 10 MiB.

The app attaches only to the owned internal `portfolio_edge` bridge and publishes no host port. The reverse-proxy coordinator persists NPM's connection to that bridge and routes to `samuel-homepage:3000`. Docker 29 on the target refused loopback publications for the internal bridge despite showing a port binding; the failed pre-activation receipt is retained. Health probes now use only the inspected, private IPv4 address of the container on this exact bridge, with HTTP proxies disabled. Additional networks or nonprivate probe addresses fail closed.

A temporary canary passes container health and seven bounded HTTP checks before replacing the app: root/security headers, Orbitals, unknown-route 404, untrusted-host 421, approved image optimization, query-variant rejection and the exact served headshot hash. The active release passes the same checks. The image ID is then persisted in the host's dedicated `.env`; `release-state.json` records the revision, previous image and gate results. A failed release restores and rechecks the previous image. A failed first release removes only the portfolio app. A rollback failure records `failed-rollback-unverified` and requires operator recovery through existing SSH access. The temporary canary is removed after the attempt.

For an operator rollback, use the immutable `previousImage` recorded in the private release receipt and the matching revision manifest, or invoke the fixed Compose configuration with that image ID and rerun the release gates. Do not rebuild the prior image, alter another application, remove its volumes or change proxy configuration as part of an image rollback. During migration, the original home deployment remains available until the coordinator verifies the new public route; restoring that prior proxy/DNS target remains the migration rollback path.

## Verification scope

Run the meaningful helper regressions without Docker or network access:

```sh
python3 scripts/test-vps-release.py
```

This covers manifest scope, successful image persistence/canary cleanup, failed canary isolation, failed release rollback, first-release cleanup, failed rollback receipts, revision mismatch, unowned networks and restricted probe addresses. It does not substitute for an actual built-image candidate or public migration acceptance. The dated results and remaining cutover status are recorded in [the verification guide](VERIFICATION.md#vps-migration-candidate-13-october-2026).
