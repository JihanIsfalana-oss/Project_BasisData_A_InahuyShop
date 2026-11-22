# M-15 RC-1 release handover

## Release decision

**Status: handover candidate only. Production release and final acceptance are
not approved.**

- Candidate label: `M-15 RC-1`. This is a handover label, not the product
  version.
- Branch: `m-15`.
- Candidate commit: the M-15 milestone commit on `m-15`. This records the
  handover only; it is not production approval.
- Product version: pending owner approval. API/mobile packages currently use
  `1.0.0`; web packages use `0.0.0`.
- Deployment: none. No production service or store build was created.

Review the complete branch diff and record its commit before building a
release artifact.

## Release notes

This candidate consolidates the following verified work:

- Shared API client preserves the `/api/v1` prefix for leading-slash paths
  and supports empty `204` responses.
- Admin mutations write actor, action, resource ID, and request ID to a
  database audit log with 365-day retention.
- Database generation can run without production credentials. Production
  database connections and migrations require a provider CA and strict TLS
  verification.
- Deployment workflows and provider setup guidance are manual and gated.
  They do not provision cloud resources or bypass migration approval.
- Transitive dependency advisories were patched; the full workspace audit is
  clean.
- Added API, database, installation, admin operations, incident, and release
  handover documentation.
- Fixed formatting in three admin web files so the repository verification
  command can run.

## QA evidence

Results below cover local automated checks only. They are not production
acceptance, device QA, or restore evidence.

| Command                                                                                                                                                 | Result                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `pnpm verify`                                                                                                                                           | Passed.                                              |
| `pnpm --filter api test`                                                                                                                                | Passed; 17 tests, 1 MySQL integration test skipped.  |
| `pnpm --filter api exec node --test test/integration.test.js` with `RUN_DB_INTEGRATION=true`                                                            | Passed; 1/1 against an isolated MySQL 8.4 container. |
| `pnpm --filter @inahuyshop/database db:migrate:deploy`                                                                                                  | Passed; 2 migrations found, none pending.            |
| `pnpm exec node --test packages/database/test/client.test.js packages/database/test/client-config.test.js packages/database/test/prisma-config.test.js` | Passed; 9 tests.                                     |
| `pnpm --filter admin-web test`                                                                                                                          | Passed; 8 tests.                                     |
| `pnpm --filter customer-mobile exec tsc --noEmit`                                                                                                       | Passed.                                              |
| `pnpm --filter admin-mobile exec tsc --noEmit`                                                                                                          | Passed.                                              |
| `pnpm audit`                                                                                                                                            | Passed; no known vulnerabilities.                    |
| `pnpm peers check`                                                                                                                                      | Passed; no peer dependency issues.                   |
| `docker build -f apps/api/Dockerfile -t inahuyshop-api:m15-rc-check .`                                                                                  | Passed.                                              |

The regular API suite skips its database test unless `RUN_DB_INTEGRATION=true`;
the test was also run successfully against an isolated MySQL 8.4 container.
EAS build, cloud deployment, production smoke test, backup/restore drills, and
Android/iOS device QA were not run.

## Known blockers and risks

| Area             | Status before production                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payments         | Checkout payment is simulated; no real payment provider is integrated.                                                                                   |
| Shipping         | Shipping charge is zero; product policy is undecided.                                                                                                    |
| Admin catalog    | Current admin interfaces do not provide full product/variant or digital asset editing.                                                                   |
| Infrastructure   | Domains, provider accounts, production secrets, TLS, and service configuration are not provisioned.                                                      |
| Backups          | MySQL and persistent-disk backup destinations, schedules, retention, and restore drills are not configured or verified.                                  |
| Monitoring       | Production Sentry/provider alerts and their owners are not configured.                                                                                   |
| Mobile           | EAS project IDs, production environment values, signing credentials, and store approval are not ready. Admin native identifiers also need configuration. |
| Operations       | Production support channel, incident owner, escalation contact, and response targets are unassigned.                                                     |
| QA               | Docker image build passed. Production smoke test, backup/restore, and device QA remain unverified.                                                       |
| Dependency audit | Full workspace audit reports no known vulnerabilities; peer dependency check reports no issues.                                                          |

See the [production runbook](./production-runbook.md) for deployment gates and
the [admin operations guide](./admin-operations.md) for supported admin
workflows.

## Acceptance and release gates

- [ ] Product owner approves payment and shipping policies.
- [ ] Operations owner configures providers, domains, TLS, secrets, monitoring,
      backup destinations, and support contacts.
- [ ] Isolated database integration and production-like smoke tests pass.
- [ ] Database and digital-file restore drills pass and are recorded.
- [ ] EAS builds and Android/iOS device QA pass; store submission is approved.
- [ ] Dependency audit and final branch review are recorded against an
      immutable commit.
- [ ] Product version is selected consistently across packages.
- [ ] Final acceptance is recorded by the authorized owner.

Until every required gate is accepted, keep this candidate out of production
and do not describe it as production-ready.
