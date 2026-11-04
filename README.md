# InahuyShop

Monorepo untuk platform e-commerce single-store yang mencakup API,
storefront web, admin web, customer mobile, dan admin mobile.

## Struktur

- `apps/api` — API Express.
- `apps/storefront-web` — storefront pelanggan berbasis React dan Vite.
- `apps/admin-web` — dashboard admin berbasis React dan Vite.
- `apps/customer-mobile` — aplikasi Expo pelanggan.
- `apps/admin-mobile` — aplikasi Expo admin.
- `packages` — kontrak dan package bersama.

## Prasyarat

- Node.js 22.
- pnpm 12.16.1, sesuai nilai `packageManager` di root `package.json`.
- Docker Engine dan Docker Compose v2 untuk menjalankan API bersama MySQL.

## Mulai pengembangan

```powershell
pnpm install --frozen-lockfile
pnpm dev:api
```

Web dapat dijalankan dengan `pnpm dev:storefront` atau
`pnpm dev:admin-web`. Aplikasi mobile dapat dijalankan dengan
`pnpm dev:customer-mobile` atau `pnpm dev:admin-mobile`.

Untuk lingkungan Docker API dan MySQL, salin `.env.example` menjadi
`.env`, ubah password lokal, lalu jalankan `docker compose up --build`.
API menyediakan endpoint pemeriksaan `http://localhost:3000/api/health`.
API saat ini belum menggunakan koneksi database.

## Pemeriksaan

Jalankan `pnpm verify` sebelum membuka pull request. Perintah ini
memeriksa format, lint, build web, sintaks API, dan dependency boundary.

## Kontribusi dan keamanan

Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk alur kontribusi.
Laporkan kerentanan secara privat sesuai [SECURITY.md](./SECURITY.md);
jangan membuat issue publik untuk kerentanan yang belum diperbaiki.

Perubahan harus diajukan melalui pull request dan mendapat review
CODEOWNER. Detail desain dan perencanaan proyek tidak disertakan dalam
snapshot repository publik.
