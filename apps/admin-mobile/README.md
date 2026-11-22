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

Admin Web currently provides category management and read-only product views.
Product/variant creation, editing, and digital asset registration are API
capabilities without a complete admin UI workflow; treat them as an
operational blocker until an approved procedure exists.

## Development

```powershell
pnpm --filter admin-mobile start
pnpm --filter admin-mobile lint
pnpm --filter admin-mobile test
pnpm --filter admin-mobile exec tsc --noEmit
```

Set `EXPO_PUBLIC_API_BASE_URL` to the API v1 base URL. Use a reachable LAN
address on physical devices. Production builds require HTTPS; this variable is
public app configuration, not a secret.

## Release

Before a production build, link the Expo project and configure
`extra.eas.projectId`, `android.package`, and `ios.bundleIdentifier`. The
current app config does not yet include these identifiers, so the EAS workflow
will stop at its preflight. Set `EXPO_PUBLIC_API_BASE_URL` in the Expo
production environment and configure signing credentials in Expo.

```powershell
pnpm dlx eas-cli@27.11.0 build --platform all --profile production
```

The repository's manual [EAS workflow](../../.github/workflows/eas-release.yml)
builds selected apps and platforms; it does not submit them to app stores.
See the [production runbook](../../ops/production-runbook.md) before release.
