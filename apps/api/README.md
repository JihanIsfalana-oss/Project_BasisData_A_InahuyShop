# API

The Express application is built in `src/app.js`; `src/server.js` connects
the application to the Prisma database client and starts the HTTP server.
All business endpoints are under `/api/v1`. Keep database access in the API;
clients must not connect to MySQL directly.

## Local configuration

The API reads `PORT`, `NODE_ENV`, and the `MYSQL_*` settings from the process
environment. In local development, copy the root `.env.example` to `.env`.
Production secrets must be injected by the deployment platform's secret
manager; do not commit `.env` files or log environment values.
Production also requires `MYSQL_SSL_CA_FILE`, `SENTRY_DSN`, and exact HTTPS
origins in `CORS_ALLOWED_ORIGINS`. The API validates the MySQL server
certificate and rejects production startup when its CA file or browser
origins are missing. Mount private digital files at the persistent
`DIGITAL_STORAGE_ROOT`; keep one API instance while storage and rate limits
are instance-local. See the [production runbook](../../ops/production-runbook.md).

## Endpoints

| Method | Path          | Purpose                                                 |
| ------ | ------------- | ------------------------------------------------------- |
| `GET`  | `/api/health` | Liveness check; does not depend on MySQL                |
| `GET`  | `/api/ready`  | Readiness check; returns success only if MySQL responds |

### Authentication

| Method | Path                       | Access    |
| ------ | -------------------------- | --------- |
| `POST` | `/api/v1/auth/register`    | Public    |
| `POST` | `/api/v1/auth/login`       | Public    |
| `POST` | `/api/v1/auth/admin/login` | Public    |
| `GET`  | `/api/v1/auth/me`          | Signed in |
| `POST` | `/api/v1/auth/logout`      | Signed in |
| `GET`  | `/api/v1/admin/session`    | Admin     |
| `GET`  | `/api/v1/customer/session` | Customer  |

Successful authentication returns an opaque bearer token once. Tokens are
stored as SHA-256 digests in `auth_sessions`, expire after seven days, and
are revoked on logout. Authentication attempts are limited to ten per
15-minute window per IP on each application instance. Production deployments
with multiple instances should configure a shared rate-limit store before
public launch. Customer registration requires name, email, phone, birth date,
and a password of at least 12 characters.

Send session tokens as `Authorization: Bearer <token>`. Admin and customer
sessions are separate. JSON request bodies are limited to 1 MB. Most
successful responses use `{ success: true, data, requestId }`; paginated
responses also include `meta`. Errors use
`{ success: false, error: { code, message, details? }, requestId }`.
Validation errors return `400`; paginated list endpoints default to `page=1` and
`pageSize=20`, with a maximum page size of 100. The response header
`x-request-id` can be used to correlate a response with server logs.

Customer login example:

```http
POST /api/v1/auth/login
Content-Type: application/json

{"identifier":"customer@example.test","password":"<password>"}
```

Checkout requires an `Idempotency-Key` of 8 to 100 characters. Physical
orders also require an owned `addressId`; `voucherCode` is optional:

```http
POST /api/v1/customer/checkout
Authorization: Bearer <customer-token>
Idempotency-Key: checkout-order-0001
Content-Type: application/json

{"addressId":1,"voucherCode":"WELCOME"}
```

Repeating a checkout with the same customer and key returns the existing
order. Digital delivery tokens are bearer credentials. Issue or rotate one
with `POST /api/v1/customer/digital-deliveries/:deliveryId/token`, then send
the returned token in `x-download-token` when downloading. Never put it in a
URL or log it.

Create or rotate an admin account through a controlled local/operations
command; do not expose admin registration over HTTP:

```powershell
$env:ADMIN_USERNAME = 'store-admin'
$env:ADMIN_PASSWORD = '<secure password of at least 16 characters>'
pnpm --filter api admin:create
```

### Public catalog

| Method | Path                          | Purpose                            |
| ------ | ----------------------------- | ---------------------------------- |
| `GET`  | `/api/v1/categories`          | Browse categories                  |
| `GET`  | `/api/v1/products`            | Search/filter and paginate         |
| `GET`  | `/api/v1/products/:productId` | Product, variants, images, reviews |

### Customer operations

All paths below require a customer bearer token.

| Method         | Path                                                       | Purpose                                                 |
| -------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| `GET/PATCH`    | `/api/v1/customer/profile`                                 | Read/update profile                                     |
| `GET/POST`     | `/api/v1/customer/addresses`                               | List/add owned addresses                                |
| `PATCH/DELETE` | `/api/v1/customer/addresses/:addressId`                    | Update/delete an owned address                          |
| `GET`          | `/api/v1/customer/cart`                                    | Read saved cart                                         |
| `POST`         | `/api/v1/customer/cart/items`                              | Add/increment variant quantity                          |
| `PATCH/DELETE` | `/api/v1/customer/cart/items/:variantId`                   | Change/remove cart item                                 |
| `POST`         | `/api/v1/customer/checkout`                                | Create an order using an `Idempotency-Key`              |
| `GET`          | `/api/v1/customer/orders`                                  | List own order history                                  |
| `GET`          | `/api/v1/customer/orders/:orderId`                         | Read own order                                          |
| `POST`         | `/api/v1/customer/orders/:orderId/payment/simulate`        | Simulate `success`, `failed`, or `expired`              |
| `POST`         | `/api/v1/customer/order-items/:orderItemId/reviews`        | Review an eligible purchased item                       |
| `POST`         | `/api/v1/customer/digital-deliveries/:deliveryId/token`    | Issue/rotate a short-lived access token                 |
| `GET`          | `/api/v1/customer/digital-deliveries/:deliveryId/download` | Download an entitled asset; token in `x-download-token` |

Physical inventory is reserved atomically during checkout and returned when a
simulated payment fails/expires or the pending order is cancelled. Digital
assets must be configured before checkout. The baseline has no shipping-price
rule; until product policy is decided, shipping cost is zero and this must be
treated as a limitation, not a configured shipping quote.

Private digital files are stored relative to `DIGITAL_STORAGE_ROOT`; the
directory must not be web-served. Set that environment variable to an
absolute path and create the file before registering its relative path as an
asset. The download endpoint checks the session owner, successful payment,
delivery expiry, and that the resolved file remains inside the private root.
Raw download tokens are returned only when issued, must be sent in
`x-download-token`, and are never stored or logged. Keeping the token out of
the URL prevents access logs and referrer headers from recording it.

### Admin operations

All paths below require an admin bearer token.

| Method                  | Path                                                                  | Purpose                                                   |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `GET`                   | `/api/v1/admin/dashboard`                                             | Operational counts                                        |
| `POST/PATCH/DELETE`     | `/api/v1/admin/categories` and `/api/v1/admin/categories/:categoryId` | Manage categories; prevent hierarchy cycles               |
| `POST/PATCH`            | `/api/v1/admin/products` and `/api/v1/admin/products/:productId`      | Create products with variants and update product metadata |
| `PATCH`                 | `/api/v1/admin/variants/:variantId`                                   | Update price, name, or physical stock                     |
| `POST`                  | `/api/v1/admin/products/:productId/images`                            | Add image metadata and alt text                           |
| `POST`                  | `/api/v1/admin/variants/:variantId/digital-assets`                    | Register a private digital asset                          |
| `GET/POST/PATCH/DELETE` | `/api/v1/admin/vouchers` and `/api/v1/admin/vouchers/:voucherId`      | Manage voucher policies                                   |
| `POST`                  | `/api/v1/admin/vouchers/:voucherId/deactivate`                        | Deactivate voucher without deleting history               |
| `GET`                   | `/api/v1/admin/orders`                                                | Search/filter and paginate orders                         |
| `PATCH`                 | `/api/v1/admin/orders/:orderId/status`                                | Begin processing or cancel a pending order                |
| `POST`                  | `/api/v1/admin/orders/:orderId/shipment`                              | Register manual shipment                                  |
| `POST`                  | `/api/v1/admin/shipments/:shipmentId/tracking`                        | Advance tracking status                                   |

The API exposes product, variant, image, and digital-asset management, but
the current Admin Web and Admin Mobile interfaces do not provide full
product/variant or asset editing. See the
[admin operations guide](../../ops/admin-operations.md) before using those
endpoints operationally.

Successful admin mutations write actor, action, resource ID, and request ID
to `admin_audit_log` in the same database transaction. Request bodies,
credentials, and digital-file paths are not copied into audit records.
Records expire after 365 days; the API prunes expired rows at startup, daily,
and before each admin mutation. Apply migration
`20261122191008_admin_audit_log` before deploying this API version.

The current checkout uses zero shipping cost because the PRD does not define
a shipping calculation policy. Set a product-approved policy before
collecting real payments or enabling production checkout. Voucher discounts
use integer IDR amounts; percentage discounts are capped at 100%, and one
voucher can be applied per order.

The existing `/api/health` response keeps its `success` and `message` fields.
All responses include the request correlation ID. Failures use
`{ success: false, error: { code, message }, requestId }`; validation errors
may include field-level `details`. Unexpected failures return a generic
message and a sanitized structured error log.

Request IDs are accepted from `x-request-id` only when they match the
restricted character set and length limit; otherwise the API generates one.
Access logs include method, path, status, duration, and request ID, but omit
query strings and request bodies.

JSON request bodies are limited to 1 MB. Routes use the
`validateBody` middleware with a validator that returns an array of
`{ field, message }` issues (an empty array means valid). Business routes
use a versioned prefix; the existing health endpoint is retained unchanged
for compatibility.

## Verification

Run API foundation tests with:

```sh
pnpm --filter api test
```

Run the API syntax check with:

```sh
pnpm check:api
```

Run the end-to-end MySQL test on a local MySQL instance after applying
migrations and provisioning the test admin. In PowerShell, set the MySQL
environment variables from `.env.example`, then run:

```powershell
$env:RUN_DB_INTEGRATION = 'true'
pnpm --filter api exec node --test test/integration.test.js
```

Docker is optional for local API development. A reachable MySQL 8 instance,
the database migration, and a private digital storage directory are required
for the integration suite; no production database should be used.
