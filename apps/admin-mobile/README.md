# Admin Mobile

Expo React Native app for focused InahuyShop operations.

## Features

- Admin-only login and SecureStore session
- Operational dashboard
- Order search and status filters
- Order detail
- Confirmed processing and cancellation actions
- Shipment creation and tracking updates
- Read-only product summary

Complex catalog editing remains in Admin Web.

## Development

```powershell
pnpm --filter admin-mobile start
pnpm --filter admin-mobile lint
pnpm --filter admin-mobile test
```

Set `EXPO_PUBLIC_API_BASE_URL` to the API v1 base URL. Production builds require HTTPS.
