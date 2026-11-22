# Production operations runbook

## Target stack

- Vercel hosts `apps/storefront-web` and `apps/admin-web` as separate Vite projects.
- Render runs the API from the repository root with `apps/api/Dockerfile`.
- Aiven provides the managed MySQL service.
- Render mounts a persistent disk at `/var/data/digital` for private digital assets.
- Sentry receives sanitized API exceptions. Expo EAS builds the mobile apps.

No production service, domain, account, or backup destination is configured by this repository.
Complete the provider setup and verify each item below before launch.

## Provider setup

1. Create one Vercel project per web app. Set each project root to its app directory and use the Vite build output `dist`.
2. Set `VITE_API_BASE_URL` for the storefront and `VITE_API_URL` for the admin web to the HTTPS API URL ending in `/api/v1`.
3. Create the Render API service from the repository root and select `apps/api/Dockerfile`.
4. Attach a persistent disk mounted at `/var/data/digital`. Set `DIGITAL_STORAGE_ROOT=/var/data/digital`.
5. Keep one API instance. The disk is instance-local, and authentication rate limits use per-instance memory. Do not scale horizontally until both storage and rate limiting use shared services.
6. Create an Aiven MySQL service. Download its CA certificate and add it to Render as a secret file. Set `MYSQL_SSL_CA_FILE` to the mounted certificate path.
7. Add these Render environment values through the provider secret manager:
   - `NODE_ENV=production`
   - `PORT=3000`
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`
   - `MYSQL_SSL_CA_FILE`
   - `CORS_ALLOWED_ORIGINS` as a comma-separated list of exact HTTPS Vercel origins
   - `DIGITAL_STORAGE_ROOT=/var/data/digital`
   - `SENTRY_DSN`
8. Configure Vercel and Render custom domains. Follow each provider's DNS instructions and wait for managed TLS certificates to become active. Use the resulting origins in `CORS_ALLOWED_ORIGINS` and the Vite API variables.
9. Create a GitHub `production` environment, require reviewer approval, and add `RENDER_DEPLOY_HOOK` as an environment secret. Disable Render auto-deploy so API releases pass the workflow and migration gate.
10. Configure provider alerts for API health, MySQL availability/capacity, and backup failures. Configure Sentry alerts for new production exceptions. Assign an operator and incident contact before launch.

## Database migration and release

1. Confirm the tested release commit and verify the current backup.
2. Run migration commands from a trusted workstation with production MySQL variables and the Aiven CA file set. Do not print or commit their values:

   ```powershell
   $env:NODE_ENV = 'production'
   pnpm --filter @inahuyshop/database db:migrate:status
   pnpm --filter @inahuyshop/database db:migrate:deploy
   pnpm --filter @inahuyshop/database db:migrate:status
   ```

3. Confirm the migration succeeded before manually dispatching `.github/workflows/deploy-production-api.yml` from `main`. Set `migration_applied` to `true` only after the checks above succeed.
4. Approve the GitHub `production` environment deployment. Deployments fail if `RENDER_DEPLOY_HOOK` is missing.
5. Configure Vercel to deploy production only after the GitHub CI check succeeds.

Never run `db:migrate:dev`, seed commands, or an unreviewed migration against production.

## Backup and restore

- Configure Aiven's managed MySQL backups and retention for the selected paid plan. Record the provider's recovery point and recovery time limits.
- Back up the Render persistent disk to a separate, encrypted destination. The disk is not a backup. Do not launch until the destination, schedule, retention, and owner are recorded.
- Restore a database backup into a separate non-production service. Verify migrations, customer/order counts, and API readiness before considering a production restore.
- Restore a disk backup into a separate volume. Verify that a known private asset can be resolved and downloaded only with a valid delivery token.
- Record each restore drill's date, source backup, result, duration, and operator. Do not overwrite production during a drill.

This repository does not provision backup schedules or destinations, and no restore has been run.

## Smoke test

After deployment, verify the API and database separately:

```powershell
Invoke-WebRequest -Uri 'https://<api-domain>/api/health'
Invoke-WebRequest -Uri 'https://<api-domain>/api/ready'
```

Then verify both web apps load, browser preflight succeeds for each configured origin, and an authorized operator can sign in. Test a private digital download with a non-production account and asset. Do not place real payment orders: checkout currently uses simulated payments and shipping has no approved production policy.

## Rollback and incidents

- If health checks fail, stop the release and use Render to redeploy the last known-good API image.
- Do not automatically reverse database migrations. Confirm the previous API is compatible with the expanded schema before redeploying it.
- Restore the database or disk only after incident-owner approval and after preserving the current state for investigation.
- Use `requestId` to correlate API logs. Sentry intentionally omits request, user, breadcrumb, extra, and exception-message data.
- For database, API, or disk incidents, record impact, start/end time, release ID, actions, and recovery evidence. Notify the assigned operator and incident contact.

## Support and incident procedure

No production support channel, named operator, incident owner, or response-time
target is configured. Assign these before launch. The severity labels below
are for triage only; they do not promise a response time.

1. **Receive and record.** Use the approved private support channel. Record
   UTC time, environment, app/release version, affected workflow, impact, and
   `requestId` when available. Do not copy passwords, tokens, private asset
   links, payment credentials, or unnecessary personal data into tickets or
   chat.
2. **Triage.**
   - **SEV 1:** suspected unauthorized access, data loss/exposure, or broad
     API/database outage. Contact the incident owner immediately and preserve
     relevant evidence.
   - **SEV 2:** a major workflow is degraded for multiple users, but a safe
     workaround exists.
   - **SEV 3:** a single-user or non-critical issue with no suspected data or
     security impact.
3. **Diagnose.** Check `/api/health` and `/api/ready`, provider status, recent
   deploys, sanitized API logs by `requestId`, and Sentry. Do not ask a
   customer to repeat a checkout when its outcome is uncertain; reconcile the
   order first and reuse the original `Idempotency-Key` only when retrying is
   necessary.
4. **Contain and recover.** Stop or limit the affected operation when needed.
   For a failed release, follow the rollback steps above and verify schema
   compatibility before redeploying. Preserve current database and disk state
   before any restore. Do not perform destructive database edits or reverse
   migrations as an incident shortcut.
5. **Verify and close.** Confirm health/readiness and the affected workflow
   with non-production data where possible. Record recovery time, evidence,
   remaining risk, and the incident owner's closure decision.
6. **Review.** Record the cause, impact, timeline, actions, and corrective
   owners. Keep security incidents on the private reporting path in
   [SECURITY.md](../SECURITY.md); do not publish unpatched vulnerability
   details.

Incident record:

```text
Incident ID:
Severity:
Environment and release:
Start/end time (UTC):
Impact and affected workflows:
Request IDs:
Actions and decisions:
Recovery evidence:
Follow-up owner and due date:
```

## Mobile builds

1. In each app directory, run `pnpm dlx eas-cli@27.11.0 build:configure` and link the Expo project. Confirm `extra.eas.projectId`, `android.package`, and `ios.bundleIdentifier` appear in the resolved app config. Choose and register admin app identifiers before continuing.
2. Complete an initial interactive EAS build for each platform and configure signing credentials. Do not send Apple or store credentials to the repository.
3. Set `EXPO_PUBLIC_API_BASE_URL` in each Expo project's `production` environment to `https://<api-domain>/api/v1`:

   ```powershell
   pnpm dlx eas-cli@27.11.0 env:set --name EXPO_PUBLIC_API_BASE_URL --value 'https://<api-domain>/api/v1' --environment production --visibility plaintext
   ```

   Replace the placeholder with the API's HTTPS URL. Set the same value as the GitHub `production` environment variable.

4. Add `EXPO_TOKEN` as a GitHub `production` environment secret.
5. Dispatch `.github/workflows/eas-release.yml` from `main`, select one app and platform, then review the completed build in Expo.
6. Submit builds to app stores only after manual QA and store-account approval. The workflow builds packages; it does not submit them.

## Launch blockers

- Production domains, DNS, TLS, provider accounts, and GitHub environment approvals are not configured.
- The database and persistent-disk backup schedules and restore drills are not configured or tested.
- Production CORS origins and mobile API URL are unknown until domains exist.
- The API rate limiter is instance-local; keep one API instance.
- Checkout uses simulated payments, and production shipping policy is undefined.
- Admin product/variant and digital-asset workflows lack a complete supported UI procedure.
- Production support channel, incident owner, escalation contact, and response targets are not assigned.
- EAS project IDs, native app identifiers, signing credentials, and store submissions need Expo and store-account setup.
