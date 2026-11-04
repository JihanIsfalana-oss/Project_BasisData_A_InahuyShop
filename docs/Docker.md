# Docker untuk API dan MySQL

Compose menyediakan API dan MySQL untuk pengembangan lokal. Aplikasi API
saat ini belum membaca atau menggunakan koneksi database; layanan MySQL
disiapkan sebagai fondasi integrasi database berikutnya.

## Prasyarat

- Docker Engine dengan Docker Compose v2 (`docker compose`).
- Salin `.env.example` ke `.env`, lalu ganti kedua nilai password dengan
  password khusus pengembangan lokal:

  ```powershell
  Copy-Item .env.example .env
  ```

  Jangan gunakan nilai contoh untuk lingkungan bersama atau production.
  File `.env` diabaikan oleh Git dan tidak disalin ke Docker build context
  maupun image.

## Menjalankan

Dari root repository:

```powershell
docker compose up --build
```

Compose menunggu MySQL berstatus sehat sebelum memulai API. API tersedia di
`http://localhost:3000`; periksa health endpoint:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Port API dan MySQL hanya dipublikasikan ke loopback host. Data MySQL
disimpan pada named volume `mysql_data`.

Hentikan layanan dengan `Ctrl+C`, atau jalankan:

```powershell
docker compose down
```

Untuk menghapus data database lokal juga, gunakan
`docker compose down --volumes`. Perintah ini menghapus volume `mysql_data`.

## Build image API saja

```powershell
docker build --file apps/api/Dockerfile --tag inahuyshop-api:local .
```

Dockerfile menggunakan Node.js 22 dan pnpm 12.16.1, memasang dependency
production API beserta workspace dependency `@inahuyshop/contracts`, lalu
menyalin hasilnya ke image runtime minimal yang berjalan sebagai user
non-root. Image tidak membawa file `.env` atau kredensial database.

GitHub Actions menjalankan job **Build API image** setelah job **Verify**
sukses. Job membuat kredensial MySQL sementara, membangun image,
menjalankan API dan MySQL melalui Compose, lalu memeriksa endpoint health
API. Job membersihkan container dan volume, serta tidak memublikasikan
image registry.

## Batasan

- Konfigurasi ini untuk pengembangan lokal, bukan deployment production.
- API belum terhubung ke MySQL; Docker Compose tidak mengubah status
  integrasi database.
- Aplikasi mobile Expo tidak dikontainerisasi.
- Hosting web statis dan deployment image production ditetapkan pada
  milestone terkait, termasuk M-14.
