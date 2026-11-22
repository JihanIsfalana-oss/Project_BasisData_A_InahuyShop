# InahuyShop Customer Mobile

Expo customer app for catalog discovery, checkout, orders, downloads, shipment
tracking, profile, addresses, and reviews.

## Environment

Set `EXPO_PUBLIC_API_BASE_URL` when the API is not available at
`http://localhost:3000/api/v1`. Use a LAN address for a physical device.
Use an `https://` URL for preview and production builds. Cleartext allowances
are enabled only for non-production builds that use `http://`.

The variable is public app configuration, not a secret. Do not put credentials
or tokens in any `EXPO_PUBLIC_*` value.

## Development

```bash
pnpm install --frozen-lockfile
pnpm --filter customer-mobile start
```

Use Expo Go for JavaScript-only work. Use a development build after adding
native modules such as SecureStore or FileSystem:

```bash
npx expo run:android
npx expo run:ios
```

## Validation

```bash
pnpm --filter customer-mobile lint
pnpm --filter customer-mobile exec tsc --noEmit
node --test apps/customer-mobile/src/lib/*.test.js
npx expo-doctor
```

## Release

```bash
pnpm dlx eas-cli@27.11.0 build --profile preview
pnpm dlx eas-cli@27.11.0 build --platform all --profile production
```

Before a production build, link the Expo project and configure
`extra.eas.projectId`, `android.package`, and `ios.bundleIdentifier`. Set
`EXPO_PUBLIC_API_BASE_URL` to the production HTTPS API URL ending in
`/api/v1`, then configure signing credentials in Expo. The repository's
manual [EAS workflow](../../.github/workflows/eas-release.yml) checks these
values and builds only; it does not submit to app stores. See the
[production runbook](../../ops/production-runbook.md).
