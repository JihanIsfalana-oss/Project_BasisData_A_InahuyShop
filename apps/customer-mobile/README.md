# InahuyShop Customer Mobile

Expo customer app for catalog discovery, checkout, orders, downloads, shipment
tracking, profile, addresses, and reviews.

## Environment

Set `EXPO_PUBLIC_API_BASE_URL` when the API is not available at
`http://localhost:3000/api/v1`. Use a LAN address for a physical device.
Use an `https://` URL for preview and production builds. Cleartext allowances
are enabled only when this variable uses `http://`.

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
npx eas-cli build --profile preview
npx eas-cli build --profile production
npx eas-cli submit --profile production
```
