# Deploying the web app to the droplet

The web build is a static single-page app. It is hosted on the Winovate
DigitalOcean droplet (`142.93.1.207`) exactly like `winovate-root`: GitHub
Actions builds it and streams a tarball over SSH to
`platformctl publish chess-alarm <tag>`, which unpacks it into a new release
directory and flips an atomic `current` symlink. Caddy serves it at
**https://chess.winovatesolutions.com** — the `*.winovatesolutions.com`
wildcard DNS record already points at the droplet, so no DNS work is needed.

The platform's rules live in `Adrian-Piwin/winovate-platform` (`CLAUDE.md`,
`NEW-PROJECT.md`). This project follows them: no ports, no build on the
droplet, no secrets in git, `platformctl` for everything.

## One-time setup (needs root SSH: `ssh apigen`)

**Quick way:** from the repo root run

```bash
./deploy/setup-droplet.sh
```

It performs steps 1–3 below (idempotent, safe to re-run), restores the
previous Caddy compose file if `platformctl caddy-up` fails, and sets the
GitHub secrets if the `gh` CLI is logged in. Then do step 4.

The manual steps, for reference:

Run these from a checkout of this repo on a machine with the `apigen` SSH alias.

### 1. Register the project

```bash
ssh apigen "platformctl new chess-alarm"
scp deploy/project.yml apigen:/opt/platform/projects/chess-alarm/project.yml
scp deploy/chess-alarm.caddy apigen:/opt/platform/caddy/sites/chess-alarm.caddy
ssh apigen "rm -f /opt/platform/projects/chess-alarm/docker-compose.yml /opt/platform/projects/chess-alarm/.env*"
ssh apigen "mkdir -p /opt/platform/data/chess-alarm/releases && \
            chown -R deploy:deploy /opt/platform/projects/chess-alarm /opt/platform/data/chess-alarm"
```

(`platformctl new` scaffolds a _service_; a static site needs no compose file
or `.env`, which is why they are removed — the same as `winovate-root`.)

### 2. Let Caddy see the release directory

Add one read-only mount to the Caddy container, next to the other static
sites in `/opt/platform/shared/docker-compose.caddy.yml`:

```yaml
- ../data/winovate-root:/srv/winovate-root:ro
- ../data/chess-alarm:/srv/chess-alarm:ro # ← add this line
```

Then recreate Caddy **through platformctl** (it validates first — never
`docker compose up` Caddy directly):

```bash
ssh apigen "platformctl caddy-up"
```

### 3. Give GitHub Actions the deploy key

```bash
ssh apigen 'cat /root/.ssh/gha_deploy' | gh secret set DEPLOY_SSH_KEY --repo Adrian-Piwin/chess-alarm
echo "142.93.1.207" | gh secret set DEPLOY_HOST --repo Adrian-Piwin/chess-alarm
```

No `gh`? Add them in GitHub → the repo → Settings → Secrets and variables →
Actions: `DEPLOY_SSH_KEY` (the contents of `/root/.ssh/gha_deploy` on the
droplet) and `DEPLOY_HOST` (`142.93.1.207`).

### 4. Deploy and verify

Merge to `main` (or run the **Deploy web** workflow manually). Then:

```bash
ssh apigen "platformctl doctor"          # expect: no problems found
ssh apigen "platformctl list"            # chess-alarm, static, sha-xxxxxxx
curl -sSI https://chess.winovatesolutions.com/   # 200 + valid certificate
```

The first request triggers Caddy's automatic HTTPS certificate.

Finally, sync the platform mirror so the repo matches the droplet:

```bash
cd winovate-platform
rsync -a --exclude='.env' --exclude='data' --exclude='backups' apigen:/opt/platform/ ./
git add -A && git commit -m "Add chess-alarm static site"
```

## Day to day

| Task            | Command                                                      |
| --------------- | ------------------------------------------------------------ |
| Deploy          | push/merge to `main`                                         |
| Roll back       | see below                                                    |
| See what's live | `ssh apigen "cat /opt/platform/projects/chess-alarm/.image"` |

**Rolling back.** `platformctl rollback` only handles compose services, so
for this static site point `current` at an earlier release (the last five are
kept):

```bash
ssh apigen "ls -1t /opt/platform/data/chess-alarm/releases"
ssh apigen "cd /opt/platform/data/chess-alarm && ln -sfn releases/sha-XXXXXXX current.tmp && mv -Tf current.tmp current"
```

The link must stay relative, or it dangles inside Caddy's bind mount.

Memory cost on the droplet: zero — it's static files served by the existing
Caddy container.

## Using a different domain

1. Point an A record at `142.93.1.207` (see the DNS table in the platform's
   `NEW-PROJECT.md`; changing a live apex domain is a human decision).
2. Add the domain to the first line of `chess-alarm.caddy` and to
   `domains:` in `project.yml`, copy both to the droplet, then
   `ssh apigen "platformctl reload-caddy"`.
3. Update the smoke-test URLs in `.github/workflows/deploy.yml`.
