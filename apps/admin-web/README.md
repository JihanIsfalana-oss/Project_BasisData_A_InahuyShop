# Admin Web

Admin web console for InahuyShop.

## Features

- Admin login and session restoration
- Operational dashboard
- Order search and filtering
- Order status updates
- Physical shipment and tracking updates
- Category and active product views
- Category and voucher management

## Development

```powershell
pnpm --filter admin-web dev
pnpm --filter admin-web test
pnpm --filter admin-web lint
pnpm --filter admin-web build
```

The API base URL defaults to `http://localhost:3000/api/v1`. Set
`VITE_API_URL` to an HTTPS API base in preview and production. This Vite
variable is public configuration, not a secret.

Run installation and local MySQL setup from the repository root; see the
[root setup guide](../../README.md).

For supported order, category, voucher, and product-visibility workflows and
their limits, see the [admin operations guide](../../ops/admin-operations.md).
