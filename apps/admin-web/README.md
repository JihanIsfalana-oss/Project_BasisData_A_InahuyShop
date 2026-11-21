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

The API base URL defaults to `http://localhost:3000/api/v1`. Set `VITE_API_URL` to use another API host.
