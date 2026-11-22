# Storefront Web

Customer storefront for InahuyShop. It uses React/Vite and the shared API
client. The API base defaults to `http://localhost:3000/api/v1`; set
`VITE_API_BASE_URL` for another environment. Use HTTPS in preview and
production. This Vite variable is public configuration, not a secret.

## Routes

- `/` and `/catalog`: public discovery, search, and category filtering.
- `/products/:id`: product detail, gallery, variant selection, and reviews.
- `/auth`: customer login and registration.
- `/cart`, `/checkout`, `/payment/:id`: protected shopping and simulation.
- `/orders`, `/orders/:id`: protected order, download, shipment, and review
  flows.
- `/account`: protected profile and address management.

Run from the repository root:

```bash
pnpm --filter storefront-web dev
pnpm --filter storefront-web lint
pnpm --filter storefront-web build
```

The API must be running with the catalog and customer routes enabled for
authenticated flows.

Run installation and local MySQL setup from the repository root; see the
[root setup guide](../../README.md).
