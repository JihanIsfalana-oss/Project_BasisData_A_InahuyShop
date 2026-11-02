# CI InahuyShop

Workflow: `.github/workflows/ci.yml`. Job: **Verify**.

## Prinsip

- CI menjalankan perintah yang sama dengan pemeriksaan lokal: `pnpm verify`.
- Versi Node dibaca dari `.nvmrc`; versi pnpm dari `packageManager` pada
  `package.json` root. Ubah versi hanya di dua tempat tersebut.
- Action GitHub di-pin ke commit SHA. Perbarui secara sengaja dan catat
  versinya pada komentar di workflow.

## Trigger

| Trigger             | Keterangan                                  |
| ------------------- | ------------------------------------------- |
| `pull_request`      | Semua Pull Request, ke branch mana pun      |
| `push` ke `main`    | Memastikan `main` tetap hijau setelah merge |
| `workflow_dispatch` | Menjalankan manual dari tab Actions         |

## Cara membaca kegagalan

Buka log langkah **Verify**. Baris yang diawali `$` menunjukkan perintah
yang sedang berjalan; kegagalan berada pada perintah `$` terakhir.

| Perintah terakhir yang tampil | Arti                                                                   | Perbaikan lokal                             |
| ----------------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `pnpm install`                | Lockfile tidak sinkron                                                 | Jalankan `pnpm install`, commit lockfile    |
| `prettier --check .`          | Ada file belum terformat                                               | `pnpm format:write`, tinjau diff, commit    |
| `eslint .` / `expo lint`      | Pelanggaran lint                                                       | `pnpm lint`, perbaiki pada aplikasi terkait |
| `vite build`                  | Build web gagal                                                        | `pnpm build`                                |
| `node --check`                | Sintaks API tidak valid                                                | `pnpm check:api`                            |
| `verify-repo` / `git diff`    | `node_modules`, lockfile liar, `.env`, atau whitespace error ter-track | `pnpm check:repo`                           |

Reproduksi lokal secara penuh:

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
pnpm install --frozen-lockfile
pnpm verify
```

## Required check

Setelah workflow terbukti hijau melalui Pull Request percobaan, aktifkan
branch protection pada `main` dengan required status check bernama
**Verify**. Nama yang tampil pada daftar check bergantung pada GitHub;
pilih entri yang muncul setelah run pertama selesai.

## Cakupan dan batasan

CI belum memeriksa: build Android/iOS, startup server API sebagai uji
integrasi, test otomatis (belum ada), dan keamanan dependency. Hasil
hijau berarti format, lint, build web, sintaks API, dan higiene
repository lulus, bukan bahwa aplikasi berfungsi.
