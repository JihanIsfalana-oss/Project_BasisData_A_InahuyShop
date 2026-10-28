# Architecture — InahuyShop

**Status:** Rekomendasi arsitektur target  
**Dokumen:** `Architecture.md`  
**Proyek:** InahuyShop | Product Digital E-Commerce

---

## 1. Tujuan Dokumen

Dokumen ini merangkum keputusan dan rekomendasi arsitektur teknis InahuyShop berdasarkan hasil pembahasan. Targetnya adalah membangun platform e-commerce yang mendukung web dan aplikasi mobile, dengan penggunaan ulang kode yang terukur serta pemisahan tanggung jawab yang jelas.

Dokumen ini merupakan rancangan arsitektur target, bukan klaim bahwa seluruh komponen telah diimplementasikan.

## 2. Target Platform

| Area | Target |
|---|---|
| Web pelanggan | React + Vite + JavaScript + JSX |
| Aplikasi mobile pelanggan | Android dan iOS |
| Dashboard admin | Website dan aplikasi mobile |
| Backend | API terpisah dari frontend; framework dan bahasa backend ditetapkan secara eksplisit pada keputusan teknis berikutnya |
| Database | MySQL sesuai PRD yang ada |
| Strategi reuse | Mengutamakan penggunaan ulang kode, termasuk abstraksi UI lintas platform jika benar-benar kompatibel |

## 3. Keputusan Frontend Web

Frontend web menggunakan **React + Vite dengan JavaScript dan JSX**, serta React Compiler sesuai konfigurasi proyek.

### 3.1 Konfigurasi yang relevan

| File | Fungsi | Status |
|---|---|---|
| `vite.config.js` | Konfigurasi Vite, plugin React, dan integrasi React Compiler | Diperlukan untuk konfigurasi Vite |
| `package.json` | Dependensi, metadata, dan perintah proyek | Wajib |
| `index.html` | Dokumen HTML utama Vite | Wajib |
| `jsconfig.json` | IntelliSense JavaScript, path alias, dan konfigurasi editor | Opsional; direkomendasikan jika diperlukan |
| `eslint.config.js` | Aturan linting dan pemeriksaan kualitas kode | Direkomendasikan |
| `tsconfig.json` | Konfigurasi TypeScript | Tidak diperlukan untuk proyek JavaScript murni |

### 3.2 Contoh `vite.config.js`

Contoh berikut berlaku apabila proyek menggunakan `@vitejs/plugin-react` dan integrasi React Compiler melalui Babel:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
});
```

Pastikan `babel-plugin-react-compiler` sudah dipasang dan versinya kompatibel dengan versi React serta plugin yang digunakan. Jika React Compiler sudah dikonfigurasi melalui mekanisme lain, jangan menambahkan konfigurasi kedua tanpa memeriksa konfigurasi yang aktif.

## 4. Struktur Aplikasi Web

Struktur dasar yang direkomendasikan untuk aplikasi web:

```text
inahuyshop-web/
├── index.html
├── package.json
├── vite.config.js
├── jsconfig.json             # opsional
├── eslint.config.js          # direkomendasikan
├── public/
└── src/
    ├── main.jsx              # entry point aplikasi
    ├── App.jsx               # root component
    ├── components/           # komponen UI yang dapat digunakan ulang
    ├── pages/                # halaman/rute
    ├── layouts/              # layout halaman
    ├── services/              # API client dan integrasi layanan
    ├── hooks/                 # custom React hooks
    ├── styles/                # CSS dan design tokens
    └── assets/                # aset yang diimpor melalui aplikasi
```

Struktur ini adalah struktur aplikasi web, bukan keseluruhan arsitektur InahuyShop. Nama folder dan pembagian modul dapat disesuaikan dengan kebutuhan aktual tanpa mengubah keputusan teknologi utama.

## 5. Arsitektur Target Lintas Platform

Karena InahuyShop menargetkan web, Android, dan iOS, arsitektur monorepo dapat digunakan untuk mengelola aplikasi serta paket bersama dalam satu repositori. Struktur berikut adalah **usulan target** dan tidak berarti seluruh direktori tersebut sudah ada di repositori saat ini.

```text
inahuyshop/
├── apps/
│   ├── storefront-web/       # React + Vite, JavaScript + JSX
│   ├── admin-web/             # dashboard admin berbasis web
│   ├── customer-mobile/       # aplikasi pelanggan Android/iOS
│   ├── admin-mobile/          # aplikasi admin Android/iOS
│   └── api/                   # backend/API terpisah
├── packages/
│   ├── domain/                # aturan bisnis yang tidak bergantung UI
│   ├── api-client/            # komunikasi API yang dapat dibagikan
│   ├── contracts/             # skema/kontrak data bersama
│   ├── validation/            # validasi bersama jika kompatibel
│   ├── design-tokens/         # warna, jarak, tipografi, dan token desain
│   └── ui/                    # komponen lintas platform yang kompatibel
├── infra/                     # konfigurasi infrastruktur dan deployment
├── docs/                      # PRD, ERD, keputusan arsitektur, dan panduan
├── scripts/                   # skrip pengembangan/otomasi
└── tests/                     # pengujian lintas aplikasi bila sesuai
```

### 5.1 Strategi penggunaan ulang kode

Prioritas penggunaan ulang:

1. **Domain logic:** aturan bisnis yang tidak terikat pada DOM atau komponen UI.
2. **API client:** fungsi komunikasi dengan backend dan penanganan respons.
3. **Contracts dan validation:** bentuk data dan validasi yang dapat digunakan bersama.
4. **Design tokens:** warna, tipografi, spacing, dan nilai desain.
5. **UI lintas platform:** komponen bersama hanya jika teknologi dan perilakunya kompatibel.

Komponen React untuk web yang menggunakan elemen DOM seperti `div`, `button`, atau `input` tidak dapat langsung dipakai sebagai komponen React Native tanpa penyesuaian. Karena itu, reuse UI harus dilakukan melalui abstraksi yang sesuai—bukan dengan menganggap seluruh komponen otomatis kompatibel.

## 6. Pemisahan Tanggung Jawab

- **Storefront web:** pengalaman belanja pelanggan melalui browser.
- **Admin web:** pengelolaan produk, pesanan, pelanggan, dan operasional melalui browser.
- **Customer mobile:** pengalaman pelanggan untuk Android dan iOS.
- **Admin mobile:** fungsi administrasi yang diperlukan saat menggunakan perangkat mobile.
- **Backend/API:** autentikasi, otorisasi, aturan bisnis, pengelolaan pesanan, pembayaran, pengiriman, dan akses aset digital.
- **Database:** penyimpanan data terpusat; akses database dilakukan melalui backend, bukan langsung dari aplikasi klien.
- **Paket bersama:** kode yang aman dan relevan untuk digunakan oleh lebih dari satu aplikasi.

Semua klien harus mengikuti aturan bisnis dan otorisasi di backend. Validasi di frontend berguna untuk pengalaman pengguna, tetapi bukan pengganti validasi dan pemeriksaan izin di server.

## 7. Keselarasan dengan PRD

PRD yang telah dibahas menetapkan MySQL sebagai database, mendukung produk digital yang dapat diunduh dan varian fisik, serta menyatakan bahwa pembayaran saat ini disimulasikan dan bukan integrasi payment gateway nyata.

Implikasi arsitektur:

- Produk digital harus memiliki referensi aset digital yang valid.
- Produk fisik memerlukan pengelolaan stok dan informasi pengiriman yang relevan.
- Pesanan dapat mencakup produk digital dan fisik sesuai aturan bisnis.
- Akses unduhan digital hanya boleh diberikan setelah status pembayaran memenuhi aturan yang ditetapkan server.
- Proses pengiriman hanya diperlukan jika pesanan mengandung produk fisik.
- File aset digital dan token unduhan harus dilindungi; jangan mengandalkan URL publik permanen sebagai mekanisme otorisasi.

Detail implementasi harus mengikuti PRD dan ERD yang berlaku. Perubahan terhadap kebutuhan bisnis perlu dicatat sebagai revisi dokumen, bukan diasumsikan secara diam-diam.

## 8. Keputusan yang Sudah Ditetapkan dan yang Belum

### Sudah ditetapkan dalam pembahasan

- Target platform mobile: Android dan iOS.
- Dashboard admin: website dan aplikasi mobile.
- Strategi reuse: memprioritaskan penggunaan ulang kode, termasuk abstraksi UI lintas platform bila sesuai.
- Frontend web: React + Vite dengan JavaScript + JSX.
- React Compiler: digunakan sesuai konfigurasi proyek.
- TypeScript: tidak digunakan dalam konfigurasi frontend web saat ini.
- Database target: MySQL, mengikuti PRD yang ada.

### Masih perlu dipastikan sebelum implementasi penuh

- Apakah aplikasi React + Vite yang sudah ada akan dipertahankan sebagai dasar monorepo atau dipindahkan setelah evaluasi.
- Framework dan bahasa backend/API.
- Framework dan pola navigasi aplikasi mobile.
- Tooling monorepo dan package manager.
- Strategi autentikasi lintas web/mobile dan pengelolaan sesi.
- Infrastruktur deployment, observability, backup, dan CI/CD.
- Batas komponen UI yang benar-benar dibagikan lintas platform.

## 9. Prinsip Implementasi

1. Pertahankan satu sumber aturan bisnis utama di backend.
2. Hindari duplikasi domain logic pada web, mobile, dan admin.
3. Jangan berbagi komponen UI hanya demi mengurangi jumlah file; pastikan reuse tidak menambah kompleksitas berlebihan.
4. Gunakan JavaScript + JSX pada aplikasi web sesuai keputusan teknologi saat ini.
5. Terapkan validasi, otorisasi, dan perlindungan aset digital di sisi server.
6. Pisahkan konfigurasi pengembangan, pengujian, dan produksi.
7. Dokumentasikan perubahan arsitektur yang memengaruhi PRD, ERD, API, atau struktur repositori.

---

**Kesimpulan:** InahuyShop diarahkan menjadi platform e-commerce multi-platform dengan React + Vite + JavaScript/JSX untuk web, dukungan Android/iOS, dashboard admin pada web dan mobile, backend/API terpisah, serta MySQL sesuai PRD. Penggunaan ulang kode menjadi prioritas, tetapi abstraksi UI lintas platform harus diterapkan secara selektif dan berdasarkan kompatibilitas teknis.
