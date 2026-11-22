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
- `ops` — runbook produksi, administrasi, dan release handover.

## Prasyarat

- Node.js 22.
- pnpm 12.16.1, sesuai nilai `packageManager` di root `package.json`.
- Docker Engine dan Docker Compose v2 untuk MySQL lokal atau API container.
- MySQL 8.4 bila menjalankan database tanpa Docker.

## Instalasi dan konfigurasi lokal

Jalankan dari root repository:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
```

Ubah password lokal di `.env`. File ini tidak boleh di-commit. Untuk perintah
yang dijalankan dari host, gunakan `MYSQL_HOST=127.0.0.1`; Compose mengatur
hostname internal `mysql` untuk API container.

Jalankan MySQL, migrasi, dan seed demo:

```powershell
docker compose up -d mysql
pnpm --filter @inahuyshop/database db:migrate:dev
pnpm --filter @inahuyshop/database db:seed
```

Pilih salah satu cara menjalankan API:

```powershell
pnpm dev:api
```

atau:

```powershell
docker compose up --build
```

API menyediakan liveness check di `http://localhost:3000/api/health` dan
readiness check yang bergantung pada MySQL di
`http://localhost:3000/api/ready`.

Jalankan web app dari root. Set URL API sebelum menjalankan Vite:

```powershell
$env:VITE_API_BASE_URL = 'http://localhost:3000/api/v1'
pnpm dev:storefront
```

```powershell
$env:VITE_API_URL = 'http://localhost:3000/api/v1'
pnpm dev:admin-web
```

Untuk Expo, gunakan alamat LAN komputer saat menjalankan pada perangkat fisik:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL = 'http://<alamat-LAN>:3000/api/v1'
pnpm dev:customer-mobile
```

Ganti perintah terakhir dengan `pnpm dev:admin-mobile` untuk aplikasi admin.
Lihat README tiap aplikasi untuk kebutuhan native module, test, dan EAS.

## Verifikasi

```powershell
pnpm verify
pnpm exec node --test packages/database/test/client.test.js packages/database/test/client-config.test.js packages/database/test/prisma-config.test.js
pnpm --filter admin-mobile exec tsc --noEmit
pnpm --filter customer-mobile exec tsc --noEmit
```

`pnpm verify` memeriksa format, lint, sintaks API, tes API, build web,
dependency boundaries, dan integritas repository. Tes MySQL end-to-end
membutuhkan database test terpisah; jangan gunakan database produksi.

## Operasi dan batasan

- Semua kanal mengakses data melalui API; web dan mobile tidak terhubung
  langsung ke MySQL.
- Checkout memakai pembayaran simulasi dan ongkir saat ini bernilai nol.
  Jangan menerima pembayaran nyata sebelum kebijakan produk disetujui.
- Production setup, backup/restore, migrasi, rollback, dan blocker launch
  tercatat di [production runbook](./ops/production-runbook.md).
- Prosedur admin ada di [admin operations](./ops/admin-operations.md).
- Status kandidat dan daftar blocker ada di
  [release handover](./ops/release-handover.md).

## Kontribusi dan keamanan

Lihat [CONTRIBUTING.md](./CONTRIBUTING.md) untuk alur kontribusi.
Laporkan kerentanan secara privat sesuai [SECURITY.md](./SECURITY.md);
jangan membuat issue publik untuk kerentanan yang belum diperbaiki.

Perubahan harus diajukan melalui pull request dan mendapat review
CODEOWNER.
