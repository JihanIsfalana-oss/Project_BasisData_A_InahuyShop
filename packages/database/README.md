# Database package

`@inahuyshop/database` owns the MySQL schema and the Prisma client. Only the
API may depend on this package; web and mobile applications must access data
through the API.

## Local setup

1. Copy the repository's `.env.example` to `.env`.
2. Start MySQL locally or run `docker compose up -d mysql`.
3. Ensure `MYSQL_HOST` is reachable from the current process. Use
   `127.0.0.1` for commands run on the host; the API container uses the
   Compose service hostname `mysql`.
4. Run these commands from the repository root:

   ```sh
   pnpm --filter @inahuyshop/database db:validate
   pnpm --filter @inahuyshop/database db:generate
   pnpm --filter @inahuyshop/database db:migrate:dev
   pnpm --filter @inahuyshop/database db:seed
   ```

Use `db:migrate:deploy` to apply committed migrations in a deployment
environment. Never run development seeds or `migrate dev` against production.
Production API and migration connections require `NODE_ENV=production` and
`MYSQL_SSL_CA_FILE` to point to the provider CA certificate. Both connections
verify the certificate; do not disable TLS verification. Prisma client
generation does not connect to MySQL and does not require database variables.
Local development may leave the CA value empty.

Check migration state before and after production deployment:

```powershell
$env:NODE_ENV = 'production'
pnpm --filter @inahuyshop/database db:migrate:status
pnpm --filter @inahuyshop/database db:migrate:deploy
pnpm --filter @inahuyshop/database db:migrate:status
```

The Prisma CLI uses the configured CA with strict certificate validation.
Missing or unreadable production CA files stop the command before connecting.
Follow the [production runbook](../../ops/production-runbook.md) for backup,
approval, deployment, and rollback gates.

## Data integrity

The schema follows the 19 business entities and transaction rules in the fixed PRD.
It preserves the composite keys for cart items, order vouchers, and shipment
tracking; database uniqueness also enforces one cart per customer, at most
one voucher and one shipment per order, and one review per order item.
Foreign keys restrict deletion of records referenced by transaction history.
The additional `admin_audit_log` table stores administrative action metadata
and expires records after 365 days; its foreign key restricts deleting an
admin account while its audit records remain.

The ERD marked `product_variant.variant_id` as only partially unique, but
`cart_item` and `order_item` reference that ID without `product_id`, and the
cart key is explicitly `(cart_id, variant_id)`. The schema therefore makes
`variant_id` globally unique and treats `product_variant` as a regular entity;
the ERD is updated to match this reference contract. Product images retain
their composite identity.

Business rules that require a transaction or cross-row check remain backend
responsibilities. In particular, order creation must atomically create its
items and payment, validate stock and voucher usage, and calculate totals;
shipments must only be created for orders containing physical variants.

Digital download tokens are bearer credentials. Store only their SHA-256
hexadecimal digest in `download_token_hash`; compare digests on access and
never persist or log the raw token. The seed contains only a demo category and
no account credentials or customer data.

The migration includes MySQL `CHECK` constraints for positive quantities,
non-negative monetary values, valid review ratings, and order total arithmetic.
Keep those constraints when editing or regenerating migrations.
