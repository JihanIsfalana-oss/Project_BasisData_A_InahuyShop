# InahuyShop --- Project Milestones & Delivery Checklist

| Atribut                   | Nilai                                                               |
| ------------------------- | ------------------------------------------------------------------- |
| Proyek                    | InahuyShop --- Product Digital E-Commerce                           |
| Versi dokumen             | 1.2                                                                 |
| Tanggal pembaruan         | 2 November 2026                                                     |
| Status                    | Baseline tracking; direkonsiliasi dengan repository setelah RS-01.6 |
| Repository                | `JihanIsfalana-oss/Project_BasisData_A_InahuyShop`                  |
| Branch terakhir diketahui | `ci/rs-01-7-ci-foundation`                                          |

> **Catatan status:** `[x]` berarti selesai dan telah dikonfirmasi.
> `[ ]` berarti belum selesai, belum dimulai, atau belum ada bukti yang
> cukup. Rancangan/dokumen tidak otomatis berarti implementasi telah
> selesai. Status yang belum didukung bukti eksplisit ditandai perlu
> konfirmasi.

## 1. Ringkasan eksekutif

InahuyShop diarahkan menjadi platform e-commerce **single-store** yang
berfokus pada produk digital, mendukung varian fisik dan pembelian
campuran. Produk memiliki empat kanal:

1.  Storefront web pelanggan.
2.  Customer mobile Android dan iOS.
3.  Admin web.
4.  Admin mobile Android dan iOS.

Arah teknis: monorepo pnpm, backend sebagai sumber kebenaran aturan
bisnis, shared packages dengan dependency boundary yang jelas, serta
pemisahan UI web dan native ketika kebutuhan platform berbeda.

### Status terkini

| Area                      | Status                              | Keterangan                                                                                         |
| ------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Analisis repository       | Selesai sebagai aktivitas analisis  | Repository telah ditinjau pada sesi awal                                                           |
| PRD                       | Baseline dokumen tersedia           | Menjadi sumber perilaku produk                                                                     |
| Arsitektur                | Selesai sebagai rancangan           | Target multi-platform telah ditetapkan                                                             |
| Struktur folder           | Selesai sebagai rancangan           | Dokumen struktur tersedia                                                                          |
| Design system             | Blueprint selesai                   | File Figma aktual dan implementasi UI belum dikonfirmasi                                           |
| ERD                       | Artefak tersedia                    | `docs/ERD/Online_Shop_Final_FIXED.erdplus`; validasi terhadap PRD belum dikonfirmasi               |
| UML                       | Artefak tersedia; review belum      | Folder `docs/UML` memuat class, use case, dan sequence diagram; validasi silang belum dikonfirmasi |
| RS-01.1--RS-01.3          | Selesai                             | Commit dan push tercatat                                                                           |
| RS-01.4                   | Selesai dengan butir terbuka        | Commit `6c2a075`; verifikasi konsumsi package oleh aplikasi dipindahkan ke RS-01.8                 |
| RS-01.5                   | Selesai                             | Commit `046fb2b`, ter-push                                                                         |
| RS-01.6                   | Selesai bersyarat (1 November 2026) | `pnpm verify` exit 0; butir cakupan terbuka dipindahkan ke RS-01.8                                 |
| RS-01.7                   | Dalam proses                        | Workflow ditulis dan divalidasi lokal; belum dijalankan pada runner GitHub                         |
| RS-01.8                   | Disetujui (2 November 2026)         | Integration proof source-first ESM; dikerjakan setelah RS-01.7                                     |
| Implementasi fitur produk | Belum dikonfirmasi                  | Starter app bukan fitur produk yang selesai                                                        |

## 2. Konvensi status

- [x] Selesai --- ada konfirmasi eksplisit atau hasil pemeriksaan yang
      tercatat.
- [ ] Belum selesai --- belum dikerjakan, belum dikonfirmasi, atau
      masih menunggu verifikasi.
- **Selesai bersyarat** --- seluruh butir wajib terpenuhi dan terbukti,
  tetapi ada butir cakupan yang sengaja dipindahkan ke item bernomor
  lain. Butir tersebut tidak boleh dicentang sebelum dibuktikan.
- **Perlu konfirmasi** --- ada aktivitas/rancangan, tetapi bukti
  artefak, validasi, atau commit belum tersedia.
- **Diusulkan** --- breakdown delivery untuk pekerjaan mendatang,
  bukan komitmen jadwal yang sudah disetujui.

---

# BAGIAN I --- DISCOVERY DAN BASELINE PRODUK

## 3. M-00 --- Project Discovery & Repository Assessment

**Tujuan:** memahami kondisi awal repository sebelum menetapkan
perubahan teknis.

### M-00.1 Identifikasi repository

- [x] Menetapkan `Project_BasisData_A_InahuyShop` sebagai repository
      proyek.
- [x] Meninjau repository melalui sesi analisis GitHub.
- [x] Menjadikan repository sebagai konteks kerja pembahasan lanjutan.

### M-00.2 Audit kondisi awal

- [x] Mengidentifikasi aplikasi web, mobile, dan API.
- [x] Mengidentifikasi direktori packages dan konfigurasi repository.
- [x] Mencatat package/source file kosong yang ditemukan saat audit
      RS-01.4.
- [x] Membedakan starter application dari implementasi fitur produk.

**Deliverable:** hasil analisis awal repository dan konteks teknis
proyek.

## 4. M-01 --- Product Requirement Baseline

**Tujuan:** menetapkan perilaku produk yang menjadi acuan desain,
arsitektur, dan implementasi.

### M-01.1 Ruang lingkup produk

- [x] Menetapkan model **single-store**, bukan marketplace
      multi-penjual.
- [x] Menetapkan fokus utama produk digital.
- [x] Mengakomodasi varian/produk fisik.
- [x] Mengakomodasi pembelian digital, fisik, dan campuran sesuai PRD.
- [x] Menetapkan pembayaran sebagai simulasi internal, bukan payment
      gateway produksi.
- [x] Menetapkan pengiriman fisik dikelola manual.
- [x] Menetapkan akses aset digital hanya setelah pembayaran berhasil
      dan kepemilikan tervalidasi.
- [x] Menetapkan empat kanal produk.
- [x] Menetapkan `PRD_Final_Fixed.md` sebagai baseline perilaku.
- [x] Menetapkan tidak ada guest checkout pada baseline.
- [x] Menetapkan maksimal satu voucher per pesanan.
- [x] Menetapkan refund, retur, dispute, login sosial, notifikasi
      WhatsApp/email, dan ongkir real-time sebagai di luar baseline
      terdokumentasi.
- [x] Memisahkan status order, payment, dan shipment.
- [ ] Melakukan sign-off formal stakeholder atas PRD, jika proses
      formal tersebut diwajibkan.

**Deliverable:** `docs/PRD/PRD_Final_Fixed.md`.

---

# BAGIAN II --- ANALISIS DAN DESAIN SISTEM

## 5. M-02 --- Target Architecture Definition

**Tujuan:** menetapkan arsitektur teknis untuk empat kanal dan backend.

### M-02.1 Keputusan platform

- [x] Web pelanggan menggunakan React + Vite.
- [x] Web menggunakan JavaScript + JSX.
- [x] React Compiler digunakan sesuai konfigurasi proyek.
- [x] Mobile menargetkan Android dan iOS.
- [x] Dashboard admin tersedia pada web dan mobile.
- [x] Strategi reuse mengutamakan penggunaan ulang kode secara
      selektif.
- [x] UI web dan native dipisahkan bila kebutuhan platform berbeda.
- [x] MySQL dipertahankan sebagai target database sesuai PRD.

### M-02.2 Pemisahan tanggung jawab

- [x] Backend menjadi sumber kebenaran business rules.
- [x] Validasi transaksi, harga, stok, voucher, otorisasi, entitlement
      unduhan, dan transisi status berada di server.
- [x] Validasi frontend berfungsi untuk UX, bukan otoritas transaksi.
- [x] API dipisahkan dari frontend.
- [x] Database package hanya untuk backend.
- [x] Dependency boundary UI web, UI native, API, dan shared packages
      ditetapkan.

### M-02.3 Keputusan lanjutan

- [ ] Finalisasi strategi autentikasi lintas web/mobile.
- [ ] Menetapkan infrastruktur deployment.
- [ ] Menetapkan observability, logging, monitoring, dan alerting.
- [ ] Menetapkan backup dan recovery database.
- [ ] Menetapkan CI/CD produksi.
- [ ] Memvalidasi source-first ESM pada Vite, Expo, dan Node melalui
      integrasi aktual.
- [ ] Memvalidasi batas abstraksi UI lintas platform berdasarkan
      kebutuhan nyata.

**Deliverable:** `Architecture.md` / `docs/ARC/Architecture.md`.

## 6. M-03 --- Application & Monorepo Structure Design

### M-03.1 Struktur aplikasi

- [x] Menetapkan lima workspace aplikasi: API, storefront web, admin
      web, customer mobile, admin mobile.
- [x] Menyusun struktur folder target beserta ekstensi dan fungsinya.
- [x] Menetapkan JavaScript + JSX untuk web; bukan TypeScript.
- [x] Mempertahankan TypeScript pada aplikasi mobile Expo/React
      Native.
- [x] Menetapkan Express 5 dan JavaScript untuk API berdasarkan
      keputusan teknis proyek.

### M-03.2 Strategi package

- [x] Menetapkan namespace `@inahuyshop/*`.
- [x] Menetapkan source-first ESM untuk tahap awal.
- [x] Menetapkan `private: true`, `"type": "module"`, dan explicit
      exports.
- [x] Menetapkan JavaScript + JSDoc untuk shared runtime packages.
- [x] Menetapkan `design-system` sebagai dokumentasi/spesifikasi,
      bukan runtime package.
- [x] Menunda package generik `shared`, `utils`, `shared-hooks`,
      `store`, `config`, dan `testing` sampai ada kebutuhan konkret.
- [x] Menetapkan pnpm workspace tanpa Turborepo/Nx pada tahap ini.

### M-03.3 Dependency boundary

- [x] `contracts` tidak memiliki dependency package internal.
- [x] `design-tokens` tidak bergantung pada React/React Native.
- [x] `ui-web` dan `ui-native` bergantung pada `design-tokens`.
- [x] UI packages tidak bergantung pada API client.
- [x] Backend tidak bergantung pada API client.
- [x] `database` hanya untuk backend.
- [x] Menetapkan consumer package yang diharapkan untuk web dan
      mobile.
- [ ] Memverifikasi dependency graph aktual setelah package mulai
      digunakan aplikasi.

**Deliverable:** dokumen struktur folder dan package dalam
`Architecture.md`.

## 7. M-04 --- Design System & UX Blueprint

### M-04.1 Design foundation

- [x] Menetapkan arah visual awal.
- [x] Menetapkan primitive dan semantic tokens sebagai rekomendasi.
- [x] Menetapkan tipografi, spacing, radius, grid, dan breakpoint
      awal.
- [x] Menetapkan baseline aksesibilitas WCAG 2.1 AA.
- [x] Menetapkan konsistensi lintas kanal tanpa memaksakan layout
      identik.

### M-04.2 Components dan patterns

- [x] Mendefinisikan komponen pelanggan.
- [x] Mendefinisikan komponen admin.
- [x] Mendefinisikan loading, empty, error, disabled, dan success
      states.
- [x] Mendefinisikan mapping status order, payment, shipment, dan
      variant.
- [x] Mendefinisikan katalog, detail produk, cart, checkout,
      pembayaran simulasi, unduhan, dan shipment.
- [x] Mendefinisikan pola admin web dan admin mobile.
- [x] Mendefinisikan alur digital, fisik, campuran, pembayaran
      gagal/kedaluwarsa, dan operasional admin.

### M-04.3 Figma dan handoff

- [ ] Membuat/menyelesaikan file Figma aktual.
- [ ] Membuat halaman Start here, Foundations, Components, Patterns,
      dan empat halaman kanal.
- [ ] Membuat variables dan component variants.
- [ ] Membuat prototipe empat alur prioritas.
- [ ] Menguji desktop, tablet, mobile, dan mobile compact.
- [ ] Memeriksa kontras, keyboard/focus, touch target, dan
      screen-reader labeling.
- [ ] Menyelesaikan handoff desain dengan daftar keputusan final dan
      gap API/data.

**Deliverable:** `docs/Design-System/InahuyShop-Design-System.md`.

**Catatan:** blueprint desain telah tersedia. File Figma aktual dan
komponen runtime belum dikonfirmasi.

## 8. M-05 --- UML & System Model Documentation

### M-05.1 Class Diagram

- [ ] Menyelesaikan UML Class Diagram `v1.0-Alpha`.
- [ ] Memastikan class, attribute, operation, visibility, dan
      relationship konsisten dengan PRD/ERD.
- [ ] Mencatat kekurangan, inkonsistensi, dan asumsi versi alpha.
- [ ] Melakukan review silang dengan PRD, Architecture, dan ERD.
- [ ] Mencatat perubahan melalui versioning diagram.

### M-05.2 Use Case Diagram

- [ ] Mengidentifikasi actor dan use case berdasarkan empat kanal.
- [ ] Menyusun Use Case Diagram.
- [ ] Memvalidasi include/extend dan system boundary terhadap PRD.
- [ ] Menyelesaikan review dan versioning.

### M-05.3 Sequence Diagram

- [ ] Menentukan skenario prioritas pelanggan dan admin.
- [ ] Menyusun Sequence Diagram alur kritis.
- [ ] Memastikan backend menjadi sumber kebenaran.
- [ ] Memvalidasi pembayaran simulasi, entitlement digital, order
      campuran, dan shipment.
- [ ] Menyelesaikan review dan versioning.

**Status:** permintaan inisialisasi Class Diagram v1.0-Alpha tercatat,
tetapi artefak final belum dapat dinyatakan selesai berdasarkan bukti
yang tersedia. Use Case dan Sequence Diagram belum dikonfirmasi selesai.

---

# BAGIAN III --- REPOSITORY STABILIZATION

## 9. RS-01 --- Repository Stabilization

**Tujuan:** menstabilkan workspace, dependency, package internal, dan
tooling sebelum implementasi fitur produk secara intensif.

### RS-01.1 Git Hygiene --- Selesai

- [x] Menghapus `apps/api/node_modules/` dari Git index tanpa
      menghapus instalasi lokal.
- [x] Memastikan `node_modules` tidak menjadi bagian repository.
- [x] Mempertahankan `.gitignore` yang sudah memadai.
- [x] Commit `0423d5e` ---
      `chore(repo): remove tracked API node_modules`.
- [x] Push tahap ini.

Branch: `chore/repository-stabilization-01-1-git-hygiene`.

### RS-01.2 Root Workspace Initialization --- Selesai

- [x] Membuat root `package.json`.
- [x] Membuat `pnpm-workspace.yaml`.
- [x] Menginisialisasi pnpm workspace.
- [x] Memastikan lima aplikasi terdeteksi.
- [x] Commit `a671dee` --- `chore(repo): initialize pnpm workspace`.
- [x] Push tahap ini.

Branch: `chore/repository-stabilization-01-2-root-workspace`.

### RS-01.3 Dependency & Lockfile Consolidation --- Selesai

- [x] Mengonsolidasikan lockfile menjadi satu root `pnpm-lock.yaml`.
- [x] Menghapus lockfile lama dari lima aplikasi.
- [x] Mempertahankan manifest aplikasi tanpa upgrade dependency yang
      tidak direncanakan.
- [x] Menetapkan shared workspace lockfile.
- [x] Mempertahankan override Rolldown `rolldown@~1.2.14` ke `1.2.15`.
- [x] Menjalankan frozen lockfile install.
- [x] Memverifikasi lint web secara terpisah.
- [x] Memverifikasi build web.
- [x] Memeriksa sintaks API.
- [x] Commit `6eb1dd8` ---
      `chore(repo): consolidate workspace dependency lockfile`.
- [x] Push tahap ini.

Branch: `chore/repo-stabilization-01-3-dependency-lockfile`.

**Catatan:** React web dan mobile tidak dipaksa menggunakan versi yang
sama. Pemeriksaan web dilakukan terpisah setelah masalah lint
rekursif/concurrency pada tahap awal.

### RS-01.4 Shared Package Initialization --- Selesai dengan butir terbuka

#### RS-01.4.1 Audit package

- [x] Mengaudit direktori package yang sudah tersedia.
- [x] Mengidentifikasi manifest dan source file yang kosong.
- [x] Mengidentifikasi package validation yang belum memiliki isi
      awal.
- [x] Memeriksa belum adanya import aplikasi yang bergantung pada
      package kosong saat audit.

#### RS-01.4.2 Package boundary dan naming

- [x] Menetapkan namespace `@inahuyshop/*`.
- [x] Menetapkan package runtime dan tooling.
- [x] Mengubah `packages/ui` menjadi `packages/ui-web`.
- [x] Membuat `packages/ui-native`.
- [x] Menghapus `packages/shared` generik yang belum memiliki tanggung
      jawab konkret.
- [x] Menetapkan `design-system` sebagai dokumentasi.

#### RS-01.4.3 Runtime package initialization

- [x] `@inahuyshop/contracts`.
- [x] `@inahuyshop/design-tokens`.
- [x] `@inahuyshop/domain`.
- [x] `@inahuyshop/validation`.
- [x] `@inahuyshop/api-client`.
- [x] `@inahuyshop/ui-web`.
- [x] `@inahuyshop/ui-native`.
- [x] `@inahuyshop/database`.
- [x] Menetapkan source-first ESM dan explicit exports.
- [x] Menetapkan JavaScript + JSDoc untuk shared runtime.
- [x] Mempertahankan file Prisma/schema yang relevan pada database
      package.

#### RS-01.4.4 Tooling package

- [x] `@inahuyshop/config-eslint`.
- [x] `@inahuyshop/config-prettier`.
- [x] `@inahuyshop/config-typescript`.
- [x] Root `prettier.config.mjs`.
- [x] Shared ESLint web config.
- [x] Export konfigurasi native pada `config-eslint`.
- [x] Konfigurasi ESLint pada aplikasi mobile.
- [x] Memverifikasi `native.mjs`: dikonsumsi dan lulus lint pada
      customer-mobile dan admin-mobile.
- [x] `api.mjs` kosong dan tidak terdaftar pada `exports`; dihapus pada
      RS-01.6 (commit `e0dc7d6`). ESLint API ditunda ke M-06.2.
- [x] Memverifikasi seluruh target package exports ada (RS-01.6; 8
      package runtime masih kosong).
- [ ] Mengaudit konsistensi peer/dependencies antar package secara
      menyeluruh (belum dilakukan; dipindahkan ke RS-01.8).

#### RS-01.4.5 Integrasi aplikasi

- [x] Menghubungkan ESLint shared ke admin-web.
- [x] Menghubungkan ESLint shared ke storefront-web.
- [x] Menambahkan ESLint Expo pada admin-mobile.
- [x] Menambahkan ESLint Expo pada customer-mobile.
- [x] Menghubungkan konfigurasi ESLint mobile ke
      `@inahuyshop/config-eslint/native`.
- [ ] Memverifikasi runtime package benar-benar dikonsumsi aplikasi
      (belum ada import permanen; dipindahkan ke RS-01.8).
- [ ] Memverifikasi source-first package pada Vite, Expo, dan Node
      melalui integrasi aktual. Baru Expo/Android yang terbukti melalui
      probe sementara pada RS-01.6; Vite dan Node belum (RS-01.8).

#### RS-01.4.6 Lockfile dan build scripts

- [x] Memusatkan dependency workspace pada root lockfile.
- [x] Mengidentifikasi `unrs-resolver` sebagai dependency transitive
      yang meminta build script.
- [x] Mempertahankan kebijakan tidak menyetujui build script secara
      otomatis sebelum audit.
- [x] Menambahkan kebijakan `allowBuilds` sesuai keputusan workspace.
- [x] `pnpm install --frozen-lockfile` dilaporkan berhasil pada
      pemeriksaan terakhir.

#### RS-01.4.7 Formatting dan lint

- [x] Menambahkan `.prettierignore`.
- [x] Menjalankan formatting pada file proyek.
- [x] Pemeriksaan Prettier dilaporkan bersih setelah lockfile
      dikecualikan.
- [x] Menjalankan ESLint admin-mobile.
- [x] Menjalankan ESLint customer-mobile.
- [x] Menjalankan ESLint admin-web.
- [x] Menjalankan ESLint storefront-web.
- [x] Menangani `react-hooks/set-state-in-effect` dengan suppression
      lokal beralasan pada hydration gate.
- [x] Meninjau diff dokumen: perubahan hanya format, diverifikasi dengan
      perbandingan yang mengabaikan whitespace. Rekonsiliasi v1.1
      menemukan bahwa Prettier meratakan lima tabel non-GFM pada
      dokumen ini; sudah diperbaiki.
- [ ] Meninjau diff kode baris demi baris (belum dilakukan; lint dan
      build lulus, tetapi itu bukan bukti tidak ada perubahan
      fungsional tidak disengaja).

#### RS-01.4.8 Commit

- [x] Memastikan seluruh perubahan RS-01.4/tooling masuk commit lokal.
- [x] Memeriksa hash dan commit message final.
- [x] Memastikan working tree bersih.
- [x] Memastikan status remote/push secara eksplisit jika akan dipush.

**Catatan:** commit `6c2a075`
(`chore(repo): initialize shared workspace packages`) terverifikasi pada
riwayat Git remote.

### RS-01.5 Development Tooling --- Selesai

- [x] Konfigurasi Prettier terpusat.
- [x] Konfigurasi ESLint web terpusat.
- [x] Konfigurasi ESLint native/mobile terpusat.
- [x] Konfigurasi ESLint empat aplikasi.
- [x] Formatting file yang ditargetkan.
- [x] `.prettierignore` tersedia.
- [x] Pemeriksaan lint empat aplikasi lulus.
- [x] `pnpm install --frozen-lockfile` berhasil.
- [x] Commit akhir tooling: `046fb2b`
      `chore(tooling): configure shared ESLint and Prettier`, ter-push.

### RS-01.6 Verification --- Selesai bersyarat

Diselesaikan pada 1 November 2026. Branch:
`chore/repository-stabilization-01-6-verification`. Commit: `0999183`
(script verifikasi), `e0dc7d6` (penghapusan `api.mjs` dan
`tamagui.config.ts`), `c48f773` (dokumentasi progres).

- [x] Menjalankan pemeriksaan workspace dari root (`pnpm verify`).
- [x] Frozen lockfile install berhasil dari instalasi bersih
      (`node_modules` dihapus; pnpm 12.16.1).
- [x] Prettier check dari root bersih.
- [x] ESLint empat aplikasi lulus. API belum memiliki lint (ditunda ke
      M-06.2).
- [x] Build storefront-web berhasil.
- [x] Build admin-web berhasil.
- [x] API: sintaks valid, server menyala, `/api/health` mengembalikan
      `200 OK`.
- [x] Expo/Metro memuat workspace package: `@inahuyshop/contracts`
      berhasil dibundel pada Android (satu package, bundel produksi,
      probe sementara yang tidak di-commit).
- [x] Seluruh target package exports ada. Package runtime berstatus
      kosong: `api-client`, `contracts`, `database`, `design-tokens`,
      `domain`, `ui-native`, `ui-web`, `validation`.
- [x] Tidak ada lockfile aplikasi yang tersisa.
- [x] Tidak ada `node_modules`, `.DS_Store`, atau `.env` yang ter-track.
- [x] `git diff --check` bersih.
- [x] Branch, working tree, dan commit diperiksa; branch ter-push.
- [x] Hasil verifikasi dicatat (bagian ini).
- [ ] Dependency boundaries teruji. Saat ini terpenuhi secara trivial
      karena belum ada package yang saling bergantung (RS-01.8).
- [ ] Expo/Metro pada iOS, web, dan dev server, serta package
      ber-peer-dependency seperti `ui-native` (RS-01.8).

**Catatan jujur:** hasil hijau pada lint dan build tidak membuktikan
package dikonsumsi dengan benar, karena belum ada aplikasi yang
mengimpor package runtime secara permanen.

### RS-01.7 CI Foundation --- Dalam proses

Artefak: `.github/workflows/ci.yml`, `.nvmrc`, `docs/CI.md`. Workflow
telah lulus `actionlint` dan `pnpm verify` lokal, tetapi **belum pernah
dijalankan pada runner GitHub**. Butir bertanda `[ ]` di bawah menunggu
run pertama.

- [x] Menentukan platform CI: GitHub Actions.
- [x] Menentukan trigger: `pull_request`, `push` ke `main`, dan
      `workflow_dispatch`.
- [x] Menentukan versi Node: 22, melalui `.nvmrc`.
- [ ] Pnpm versi terkunci pada CI (dibaca dari `packageManager`; belum
      terbukti pada runner).
- [ ] Frozen lockfile install pada CI.
- [ ] Prettier check, ESLint, dan build web pada CI (melalui
      `pnpm verify`).
- [x] Menentukan pemeriksaan API/mobile yang realistis: sintaks API
      dan `expo lint`. Build Android/iOS dan uji startup API belum
      masuk CI (dicatat pada `docs/CI.md`).
- [ ] Dependency caching (`cache: pnpm`; belum terbukti pada runner).
- [ ] Memastikan versi Node lokal pengembang sesuai `.nvmrc`.
- [ ] Menguji workflow melalui Pull Request percobaan.
- [ ] Menetapkan branch protection dan required check **Verify**
      (setelah workflow terbukti hijau).
- [x] Mendokumentasikan cara membaca kegagalan CI: `docs/CI.md`.

### RS-01.8 Integration Proof --- Disetujui (belum dimulai)

Tujuan: membuktikan asumsi source-first ESM pada ketiga runtime dan
menutup butir terbuka RS-01.4.5 dan RS-01.6.

- [ ] Satu package (`contracts`) diimpor secara permanen oleh API
      (Node ESM).
- [ ] Package yang sama diimpor oleh storefront-web dan admin-web
      (build Vite berhasil).
- [ ] Package yang sama diimpor oleh customer-mobile dan admin-mobile
      (Expo; Android, iOS, dev server, dan web Expo diuji).
- [ ] `ui-native` (peer dependency React Native) diimpor oleh aplikasi
      mobile tanpa duplikasi React.
- [ ] `ui-web` diimpor oleh aplikasi web (JSX melalui Vite).
- [ ] Dependency graph aktual diperiksa (`pnpm why` / `pnpm ls`); web
      dan mobile tidak memuat `database`.
- [ ] Audit peer/dependencies antar package.
- [ ] Jika source-first gagal pada salah satu runtime: keputusan dan
      alasan perubahan strategi didokumentasikan sebelum M-06.
- [ ] Hasil dicatat dan `pnpm verify` tetap lulus.

**Kriteria selesai RS-01:** workspace stabil, dependency terkonsolidasi,
package/tooling memiliki boundary jelas, dan pemeriksaan lokal serta CI
dapat dijalankan secara konsisten.

---

# BAGIAN IV --- IMPLEMENTASI PRODUK

> Milestone M-06 sampai M-15 di bawah merupakan breakdown delivery yang
> disusun dari PRD dan arsitektur. Statusnya **belum dikonfirmasi
> dimulai/selesai**; checklist ini bukan klaim progres aktual.

## 10. M-06 --- Backend & Data Foundation

### M-06.1 Database

- [ ] Memfinalisasi ERD sebagai baseline relasi data.
- [ ] Memvalidasi Prisma schema terhadap ERD dan PRD.
- [ ] Menyiapkan konfigurasi koneksi MySQL per environment.
- [ ] Menyiapkan migration awal.
- [ ] Menyiapkan seed data development yang aman.
- [ ] Memastikan constraint, index, foreign key, dan unique
      constraint.
- [ ] Melindungi data sensitif dan file digital.

### M-06.2 API foundation

- [ ] Menetapkan struktur modul Express 5.
- [ ] Menyiapkan environment dan secret management.
- [ ] Menetapkan error handling dan response contract.
- [ ] Menetapkan request validation.
- [ ] Menetapkan logging dan request correlation.
- [ ] Menyiapkan health/readiness endpoint.
- [ ] Menetapkan API versioning bila diperlukan.
- [ ] Mendokumentasikan API.

### M-06.3 Authentication dan authorization

- [ ] Registrasi/login pelanggan.
- [ ] Autentikasi admin.
- [ ] Session/token lifecycle.
- [ ] Role/permission checks.
- [ ] Pengujian akses lintas role dan kepemilikan resource.
- [ ] Proteksi endpoint admin.

### M-06.4 Domain dan business rules

- [ ] Product dan product variant.
- [ ] Category dan atribut produk.
- [ ] Cart dan order.
- [ ] Snapshot harga/item transaksi.
- [ ] Voucher sesuai PRD.
- [ ] Simulasi payment dan statusnya.
- [ ] Shipment manual untuk item fisik.
- [ ] Entitlement dan protected download untuk item digital.
- [ ] Review sesuai eligibility.
- [ ] Pengujian transisi status order, payment, dan shipment secara
      terpisah.

### M-06.5 Security dan correctness

- [ ] Otorisasi setiap endpoint.
- [ ] Validasi harga dan stok di server.
- [ ] Pencegahan duplicate submission/idempotency untuk operasi
      relevan.
- [ ] Pengujian race condition stok dan checkout.
- [ ] Pengujian akses file digital tanpa entitlement.
- [ ] Pengujian manipulasi harga, diskon, role, dan status.
- [ ] Pengujian transaksi database dan rollback.

## 11. M-07 --- Shared Runtime Packages

**Status:** skeleton/manifest package diinisialisasi pada RS-01.4; isi
dan integrasi fitur belum dikonfirmasi.

### M-07.1 Contracts

- [ ] Mendefinisikan DTO, request, dan response contracts.
- [ ] Mendefinisikan enum/status lintas layer.
- [ ] Mendokumentasikan compatibility policy.
- [ ] Memastikan contract tidak memuat business logic backend.

### M-07.2 Domain

- [ ] Mengimplementasikan pure business logic yang layak dibagikan.
- [ ] Menjaga domain bebas dari dependency UI/API client.
- [ ] Menambahkan unit test.

### M-07.3 Validation

- [ ] Menentukan schema validation library.
- [ ] Mengimplementasikan schema reusable.
- [ ] Memastikan validasi kritis tetap dijalankan di backend.
- [ ] Menambahkan test input valid dan invalid.

### M-07.4 API Client

- [ ] Menetapkan transport, base URL, timeout, dan error
      normalization.
- [ ] Menetapkan auth/session injection.
- [ ] Menetapkan serialization/response handling.
- [ ] Menambahkan test mocked transport.
- [ ] Memastikan tidak memuat business rules server.

### M-07.5 Design tokens dan UI

- [ ] Mengimplementasikan design tokens runtime.
- [ ] Mengimplementasikan komponen `ui-web`.
- [ ] Mengimplementasikan komponen `ui-native`.
- [ ] Menentukan logic yang dapat dibagikan tanpa memaksakan UI lintas
      platform.
- [ ] Menambahkan dokumentasi dan test komponen.
- [ ] Memeriksa aksesibilitas dan responsive behavior.

### M-07.6 Database package

- [ ] Menyelesaikan Prisma client/schema/migration integration.
- [ ] Menetapkan exports untuk backend.
- [ ] Memastikan package database tidak masuk dependency graph
      web/mobile.

## 12. M-08 --- Storefront Web

**Status:** starter tersedia; fitur storefront belum dikonfirmasi
selesai.

### M-08.1 Foundation

- [ ] Routing dan layout.
- [ ] Design tokens dan UI web.
- [ ] API client.
- [ ] Auth state dan protected routes.
- [ ] Error boundary dan loading strategy.

### M-08.2 Discovery dan katalog

- [ ] Beranda storefront.
- [ ] Katalog produk.
- [ ] Pencarian dan filter.
- [ ] Detail produk dan gallery.
- [ ] Pemilihan varian digital/fisik.
- [ ] Penanganan produk/varian tidak tersedia.

### M-08.3 Transaksi

- [ ] Cart.
- [ ] Voucher.
- [ ] Login/registrasi gate.
- [ ] Checkout digital.
- [ ] Checkout fisik.
- [ ] Checkout campuran.
- [ ] Payment simulation.
- [ ] Payment success/failure/expired states.

### M-08.4 Post-purchase

- [ ] Riwayat dan detail pesanan.
- [ ] Digital download access.
- [ ] Shipment tracking untuk item fisik.
- [ ] Review dan rating sesuai eligibility.
- [ ] Profile dan address management.

### M-08.5 Quality

- [ ] Responsive desktop/tablet/mobile.
- [ ] Accessibility review.
- [ ] Loading/empty/error/success states.
- [ ] Integration test alur pembelian.
- [ ] E2E test skenario prioritas.
- [ ] Performance dan bundle review.

## 13. M-09 --- Customer Mobile

**Status:** Expo starter tersedia; fitur produk belum dikonfirmasi
selesai.

### M-09.1 Foundation

- [ ] Navigation structure.
- [ ] Auth/session lifecycle.
- [ ] Integrasi `ui-native`, tokens, dan API client.
- [ ] Environment Android/iOS.
- [ ] Permission dan secure storage sesuai kebutuhan.

### M-09.2 Customer shopping flow

- [ ] Beranda/katalog.
- [ ] Pencarian/filter.
- [ ] Detail produk dan varian.
- [ ] Cart dan voucher.
- [ ] Checkout dan payment simulation.
- [ ] Order history/detail.
- [ ] Digital downloads.
- [ ] Shipment tracking.
- [ ] Profile/address.
- [ ] Review.

### M-09.3 Mobile quality

- [ ] Pengujian Android.
- [ ] Pengujian iOS.
- [ ] Ukuran layar dan safe area.
- [ ] Offline/network interruption behavior.
- [ ] Accessibility dan system text scaling.
- [ ] Release build dan distribution pipeline.

## 14. M-10 --- Admin Web

**Status:** starter tersedia; dashboard operasional belum dikonfirmasi
selesai.

### M-10.1 Foundation

- [ ] Admin authentication dan authorization.
- [ ] Admin shell, navigation, sidebar, dan topbar.
- [ ] API integration dan error handling.
- [ ] Permission-aware route/action.

### M-10.2 Operations

- [ ] Dashboard ringkasan operasional.
- [ ] Product CRUD.
- [ ] Product variant management.
- [ ] Category management.
- [ ] Digital asset management yang aman.
- [ ] Order list dan filter.
- [ ] Order detail.
- [ ] Payment status visibility.
- [ ] Manual shipment/tracking management.
- [ ] Voucher management.
- [ ] Review moderation bila termasuk PRD.

### M-10.3 Quality

- [ ] Audit aksi penting.
- [ ] Konfirmasi aksi destruktif.
- [ ] Validasi server untuk perubahan bisnis.
- [ ] Responsive layout dan accessibility.
- [ ] Integration/E2E test operasional.

## 15. M-11 --- Admin Mobile

**Status:** Expo starter tersedia; fitur operasional belum dikonfirmasi
selesai.

### M-11.1 Foundation

- [ ] Admin authentication khusus.
- [ ] Navigation operasional.
- [ ] Permission-aware action.
- [ ] Secure session handling.

### M-11.2 Operations

- [ ] Ringkasan antrean operasional.
- [ ] Daftar pesanan dan filter.
- [ ] Detail pesanan.
- [ ] Tindak lanjut shipment dan tracking.
- [ ] Produk ringkas dan quick action yang aman.
- [ ] Error, loading, empty, dan confirmation states.

### M-11.3 Scope control

- [ ] Memprioritaskan pekerjaan operasional harian.
- [ ] Tidak memaksakan editor tabel massal atau konfigurasi kompleks
      admin web ke mobile.
- [ ] Mengarahkan pekerjaan kompleks ke admin web bila belum didukung
      mobile.
- [ ] Menguji Android dan iOS.

---

# BAGIAN V --- INTEGRASI, QUALITY, DAN RELEASE

## 16. M-12 --- Cross-Platform Integration

- [ ] Mengintegrasikan seluruh kanal dengan API yang sama.
- [ ] Memastikan kontrak request/response konsisten.
- [ ] Memastikan auth/session konsisten dan aman.
- [ ] Memastikan status transaksi konsisten pada web dan mobile.
- [ ] Memastikan aturan bisnis tidak diduplikasi dengan perilaku
      berbeda.
- [ ] Memastikan entitlement digital tidak bergantung pada UI client.
- [ ] Memastikan shipment hanya berlaku pada order yang memiliki item
      fisik.
- [ ] Menguji pembelian digital, fisik, dan campuran end-to-end.
- [ ] Menguji pembayaran gagal dan kedaluwarsa.
- [ ] Menguji admin action dan perubahan status.
- [ ] Menguji kompatibilitas package pada Vite, Expo, dan Node.

## 17. M-13 --- Quality Assurance & Security

### M-13.1 Testing

- [ ] Unit test domain dan validation.
- [ ] API integration test.
- [ ] Database migration test.
- [ ] Component test web/native.
- [ ] E2E test storefront.
- [ ] E2E test admin.
- [ ] Mobile test Android/iOS.
- [ ] Regression test alur transaksi.

### M-13.2 Security

- [ ] Authentication dan authorization review.
- [ ] Input validation review.
- [ ] SQL/database access review.
- [ ] Digital asset/download authorization review.
- [ ] Secret/environment configuration review.
- [ ] Dependency vulnerability review.
- [ ] Rate limiting/abuse review pada endpoint relevan.
- [ ] Audit log operasi administratif penting.

### M-13.3 UX dan accessibility

- [ ] WCAG 2.1 AA review sesuai baseline.
- [ ] Keyboard/focus web.
- [ ] Screen-reader labeling.
- [ ] Touch target dan system text scaling mobile.
- [ ] Error dan empty state.
- [ ] Responsive overflow dan konten panjang.

### M-13.4 Performance dan reliability

- [ ] Mengukur performa web.
- [ ] Mengukur performa API dan query database.
- [ ] Memeriksa caching dan pagination.
- [ ] Memeriksa bundle size dan mobile startup.
- [ ] Menguji network interruption dan retry.
- [ ] Menetapkan target availability/reliability.

## 18. M-14 --- Deployment & Production Readiness

- [ ] Memilih hosting frontend.
- [ ] Memilih hosting API.
- [ ] Menyiapkan MySQL production.
- [ ] Menyiapkan domain, DNS, TLS, dan environment.
- [ ] Menyiapkan secret management.
- [ ] Menyiapkan migration deployment procedure.
- [ ] Menyiapkan backup dan menguji restore.
- [ ] Menyiapkan logging, monitoring, alerting, dan error tracking.
- [ ] Menyiapkan CI/CD deployment.
- [ ] Menyiapkan rollback strategy.
- [ ] Menyiapkan Android release pipeline.
- [ ] Menyiapkan iOS release pipeline.
- [ ] Menyelesaikan production smoke test.
- [ ] Menyelesaikan operational runbook.

## 19. M-15 --- Release & Handover

- [ ] Menetapkan release candidate.
- [ ] Menyelesaikan blocker QA.
- [ ] Menyelesaikan dokumentasi instalasi dan konfigurasi.
- [ ] Menyelesaikan dokumentasi API.
- [ ] Menyelesaikan dokumentasi database dan migration.
- [ ] Menyelesaikan dokumentasi operasional admin.
- [ ] Menyelesaikan release notes.
- [ ] Menyelesaikan handover desain dan implementasi.
- [ ] Menetapkan support dan incident response procedure.
- [ ] Melakukan final acceptance.
- [ ] Menetapkan versi rilis produk pertama.

---

# BAGIAN VI --- URUTAN EKSEKUSI DAN PENGENDALIAN

## 20. Urutan milestone

| Urutan | Milestone                                      | Status                                  |
| -----: | ---------------------------------------------- | --------------------------------------- |
|      1 | M-00 Project Discovery & Repository Assessment | Selesai                                 |
|      2 | M-01 Product Requirement Baseline              | Baseline dokumen tersedia               |
|      3 | M-02 Target Architecture Definition            | Selesai sebagai rancangan               |
|      4 | M-03 Application & Monorepo Structure Design   | Selesai sebagai rancangan               |
|      5 | M-04 Design System & UX Blueprint              | Selesai sebagai blueprint               |
|      6 | M-05 UML & System Model Documentation          | Artefak tersedia; review belum          |
|      7 | RS-01 Repository Stabilization                 | Dalam proses (RS-01.1--RS-01.6 selesai) |
|      8 | M-06 Backend & Data Foundation                 | Belum dikonfirmasi                      |
|      9 | M-07 Shared Runtime Packages                   | Skeleton; isi belum                     |
|     10 | M-08 Storefront Web                            | Belum dikonfirmasi                      |
|     11 | M-09 Customer Mobile                           | Belum dikonfirmasi                      |
|     12 | M-10 Admin Web                                 | Belum dikonfirmasi                      |
|     13 | M-11 Admin Mobile                              | Belum dikonfirmasi                      |
|     14 | M-12 Cross-Platform Integration                | Belum dimulai                           |
|     15 | M-13 QA & Security                             | Belum dimulai                           |
|     16 | M-14 Deployment & Production Readiness         | Belum dimulai                           |
|     17 | M-15 Release & Handover                        | Belum dimulai                           |

---

## 21. Gate yang tidak boleh dilewati

1.  **Product gate:** jangan implementasikan fitur yang bertentangan
    dengan PRD final.
2.  **Architecture gate:** jangan menambah dependency lintas layer tanpa
    alasan dan review.
3.  **Repository gate:** selesaikan RS-01 verification sebelum workspace
    dinyatakan stabil.
4.  **Data gate:** jangan implementasikan transaksi sebelum ERD/schema
    dan constraint tervalidasi.
5.  **Security gate:** jangan membuka akses file digital hanya
    berdasarkan status UI/client.
6.  **Integration gate:** jangan menyatakan empat kanal selesai sebelum
    alur transaksi diuji end-to-end.
7.  **Release gate:** jangan menyatakan production-ready sebelum
    backup/restore, monitoring, security, dan rollback diuji.

## 22. Prioritas pekerjaan berikutnya

1.  [x] **Tutup commit RS-01.4/RS-01.5.** Terverifikasi: `6c2a075` dan
        `046fb2b`.
2.  [x] **Selesaikan RS-01.6 Verification** (bersyarat; butir terbuka
        dipindahkan ke RS-01.8).
3.  [ ] **Selesaikan RS-01.7 CI Foundation** (dalam proses). CI minimum yang
        menjalankan frozen install dan `pnpm verify`.
4.  [ ] **Kerjakan RS-01.8 Integration Proof** (disetujui 2 November
        2026): buktikan source-first ESM pada Vite, Expo, dan Node
        sebelum M-06.
5.  [ ] **Tinjau M-05 UML.** Artefak tersedia di `docs/UML`; lakukan
        review silang terhadap PRD, Architecture, dan ERD.
6.  [ ] **Validasi ERD dan database schema** sebagai prasyarat backend.
        `schema.prisma` saat ini kosong.
7.  [ ] **Mulai M-06 Backend & Data Foundation** berdasarkan PRD dan
        ERD.
8.  [ ] Implementasikan shared packages berdasarkan kebutuhan consumer
        nyata, bukan spekulasi.
9.  [ ] Bangun kanal secara bertahap dan integrasikan melalui API yang
        sama.

## 23. Risiko dan pengendalian

| Risiko                                         | Dampak                                        | Pengendalian                                                         |
| ---------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------- |
| Dokumen dianggap implementasi nyata            | Status proyek tampak lebih maju dari kondisi  | Pisahkan status dokumen, skeleton, implementasi, dan verifikasi      |
| Package tanpa consumer                         | Kompleksitas dan biaya maintenance            | Implementasikan berdasarkan kebutuhan nyata                          |
| Business rules diduplikasi di frontend         | Manipulasi transaksi dan status inkonsisten   | Backend tetap sumber kebenaran                                       |
| Source-first ESM tidak kompatibel              | Build/runtime error di Vite, Expo, atau Node  | Integration proof untuk tiap consumer (RS-01.8)                      |
| Formatting besar menutupi perubahan fungsional | Review diff sulit                             | Pisahkan commit formatting dan konfigurasi bila memungkinkan         |
| Lockfile diformat Prettier                     | Diff canonical pnpm membesar                  | Kecualikan `pnpm-lock.yaml` dari Prettier                            |
| Formatter merusak tabel Markdown non-GFM       | Tabel status tidak terbaca di dokumen kendali | Gunakan tabel pipe (GFM) saja; periksa render setelah `format:write` |
| Satu probe dianggap bukti kompatibilitas penuh | Kegagalan baru muncul saat implementasi fitur | Catat cakupan bukti; selesaikan RS-01.8 sebelum M-06                 |
| Scope admin mobile terlalu luas                | UX dan biaya implementasi meningkat           | Prioritaskan tugas operasional; kompleksitas tetap di admin web      |
| UI menjanjikan fitur yang belum didukung API   | Ekspektasi pengguna keliru                    | Sinkronkan UI dengan PRD dan kemampuan backend                       |

## 24. Definition of Done --- Project Release

- [ ] PRD, ERD, arsitektur, UML, dan desain konsisten.
- [ ] Repository, workspace, dependency, tooling, dan CI stabil.
- [ ] Backend/database mengimplementasikan aturan bisnis yang
      disetujui.
- [ ] Shared packages memiliki API jelas, diuji, dan benar-benar
      digunakan.
- [ ] Storefront web memenuhi acceptance criteria.
- [ ] Customer mobile berjalan pada Android dan iOS.
- [ ] Admin web mendukung operasional yang disetujui.
- [ ] Admin mobile mendukung tugas operasional yang disetujui.
- [ ] Empat kanal menggunakan sumber data dan aturan backend yang
      konsisten.
- [ ] Alur digital, fisik, dan campuran diuji end-to-end.
- [ ] Security, accessibility, performance, dan reliability memenuhi
      kriteria release.
- [ ] Deployment, backup/restore, monitoring, dan rollback diuji.
- [ ] Dokumentasi dan handover selesai.
- [ ] Final acceptance dan release approval diberikan.

## 25. Change log

| Versi | Tanggal         | Perubahan                                                                                                                                                                                                                                   |
| ----- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0   | 1 November 2026 | Inisialisasi rangkuman milestone, submilestone, checklist, urutan eksekusi, dan gate proyek                                                                                                                                                 |
| 1.1   | 2 November 2026 | Rekonsiliasi pasca RS-01.6: status RS-01.4 sampai RS-01.6 dan hash commit diperbarui; checklist RS-01.6 dipulihkan; RS-01.8 diusulkan; lima tabel yang rusak akibat Prettier diperbaiki; risiko dan prioritas diperbarui; header diperbarui |
| 1.2   | 2 November 2026 | RS-01.7 dimulai: workflow CI, `.nvmrc`, dan `docs/CI.md` ditambahkan; RS-01.8 disetujui; status dan prioritas diperbarui                                                                                                                    |

## 26. Sumber baseline

- `PRD_Final_Fixed.md` --- baseline kebutuhan dan perilaku produk.
- `Architecture.md` --- target arsitektur dan keputusan platform.
- `InahuyShop-Design-System.md` --- blueprint UX/UI empat kanal.
- `Github-Repository-Project.txt` --- referensi repository.
- Hasil verifikasi RS-01.6 (output terminal, 1 November 2026) dan
  pemeriksaan riwayat Git remote.
- Riwayat percakapan proyek tentang analisis repository, struktur
  folder, arsitektur, UML Class Diagram v1.0-Alpha, dan RS-01
  Repository Stabilization.

**Batas informasi:** status yang tidak didukung bukti eksplisit ditandai
belum dikonfirmasi/perlu verifikasi. M-06 sampai M-15 adalah breakdown
delivery yang disusun untuk mengarahkan pekerjaan berikutnya, bukan
bukti tahapan tersebut telah disetujui, dijadwalkan, atau dikerjakan.
