# InahuyShop — Design System & Figma Blueprint

| Atribut | Nilai |
|---|---|
| Produk | InahuyShop |
| Versi panduan | 1.0 |
| Status | Rekomendasi desain untuk eksplorasi dan validasi Figma |
| Bahasa produk | Bahasa Indonesia |
| Platform | Storefront web, admin web, customer mobile, admin mobile |
| Arah visual | Modern, tepercaya, bersih; putih sebagai warna dasar |
| Acuan produk utama | `../PRD/PRD_Final_Fixed.md` |

> Panduan ini merupakan spesifikasi desain produk dan blueprint library Figma. Ini bukan file Figma, bukan klaim bahwa UI sudah diimplementasikan, dan bukan pengganti validasi prototipe dengan pengguna.

## 1. Ringkasan produk

InahuyShop adalah platform e-commerce **single-store** yang terutama menjual produk digital seperti e-book dan template. Sebuah produk dapat memiliki varian digital maupun fisik. Pelanggan dapat melihat katalog, memilih varian, mengelola keranjang, checkout, menyelesaikan pembayaran simulasi, mengakses unduhan setelah pembayaran berhasil, serta mengikuti pengiriman untuk item fisik. Admin mengelola katalog, pesanan, voucher, pembayaran simulasi, dan pengiriman dari web atau mobile.

### 1.1 Peran dan kebutuhan inti

| Peran | Tujuan utama | Kebutuhan desain |
|---|---|---|
| Pengunjung | Menemukan produk yang sesuai | Katalog mudah dijelajahi, pencarian/filter jelas, detail varian dan harga transparan |
| Pelanggan | Membeli dan menerima produk | Checkout sederhana; bedakan unduhan dan pengiriman; status pesanan mudah dipahami |
| Admin toko | Mengoperasikan toko | Prioritaskan pekerjaan tertunda, pencarian cepat, kontrol status dengan konfirmasi yang tepat |

### 1.2 Prinsip pengalaman

1. **Jelas sebelum meyakinkan.** Harga, jenis pemenuhan, ketersediaan, dan total ditampilkan sebelum pelanggan berkomitmen.
2. **Unduhan bukan pengiriman.** Tandai varian digital/fisik secara konsisten; jangan tampilkan alamat atau biaya kirim yang tidak relevan.
3. **Satu pesanan, dua jalur pemenuhan.** Untuk keranjang campuran, pelanggan membayar satu kali lalu melihat status unduhan dan pengiriman sebagai jalur yang terpisah.
4. **Status menjelaskan tindakan berikutnya.** Gunakan label manusiawi, ringkasan progres, dan CTA kontekstual; jangan menampilkan kode status mentah.
5. **Admin mengutamakan pekerjaan.** Tampilkan antrean yang perlu ditindaklanjuti sebelum laporan sekunder.
6. **Konsisten lintas kanal, bukan identik.** Warna, istilah, dan aturan sama; tata letak serta kontrol menyesuaikan web atau mobile.
7. **Aksesibel secara default.** Kontras, fokus, label, ukuran target, dan pesan validasi dirancang sejak awal.

### 1.3 Batas produk yang memengaruhi desain

- Single-store; istilah `seller` pada model adalah identitas admin toko, bukan marketplace multi-penjual.
- Pembayaran adalah **simulasi internal**, tidak menggunakan payment gateway produksi. UI wajib menyatakannya dengan jelas.
- Tidak ada guest checkout; login/registrasi diperlukan untuk keranjang akun dan checkout.
- Pengiriman barang dikelola manual; nomor pelacakan dapat dicatat tetapi integrasi kurir otomatis tidak termasuk.
- Akses aset digital hanya tersedia setelah pembayaran berhasil dan validasi kepemilikan.
- Refund, retur, dispute, login sosial, notifikasi WhatsApp/email, dan ongkir real-time berada di luar cakupan baseline.
- Voucher maksimal satu per pesanan; fitur pengelolaannya prioritas P1.

## 2. Analisis kondisi proyek

### 2.1 Temuan yang relevan bagi desain

| Area | Kondisi yang ditemukan | Konsekuensi desain |
|---|---|---|
| Baseline produk | PRD final mendefinisikan toko tunggal, produk digital dengan varian fisik opsional, pembelian campuran, pembayaran simulasi, dan empat kanal | Gunakan PRD final sebagai sumber perilaku dan istilah utama |
| Dokumen analisis lama | Menyebut peran penjual dan produk digital/fisik secara umum; cakupannya lebih awal daripada PRD final | Hindari mengembangkan UI marketplace atau alur seller terpisah |
| Aplikasi web | Admin-web dan storefront-web masih menampilkan starter React/Vite | Tidak ada pola visual produk yang perlu dipertahankan |
| Aplikasi mobile | Customer-mobile dan admin-mobile masih menampilkan starter Expo | Rancang navigasi mobile dari alur produk, bukan dari tab starter |
| Design tokens | Berkas di `packages/design-tokens/src` terdeteksi kosong | Token pada panduan ini adalah rekomendasi awal untuk Figma, belum merupakan token runtime |
| Design system/UI | Berkas di `packages/design-system/src` dan `packages/ui/src` terdeteksi kosong | Komponen yang dideskripsikan perlu dibuat sebagai library Figma; jangan mengasumsikan komponen produksi sudah ada |
| Data dan alur | PRD mendefinisikan 19 entitas dan status order, payment, shipment; skema Prisma yang diperiksa kosong | Status UI harus mengikuti PRD; konfirmasi skema aplikasi sebelum implementasi |

### 2.2 Ketentuan sumber kebenaran

Jika ada perbedaan antara dokumentasi, data, dan rancangan:

1. PRD final menjadi baseline perilaku produk.
2. ERD final menjadi baseline relasi data; jangan membuat fitur yang melanggar integritas atau akses data.
3. Desain menjelaskan status dengan bahasa pengguna, tetapi tidak menambahkan transisi status bisnis baru.
4. Keputusan visual dalam dokumen ini adalah usulan yang perlu dievaluasi di Figma. Jangan menganggap hex, font, breakpoint, atau ukuran sebagai identitas brand final tanpa persetujuan tim.

## 3. Arsitektur design system di Figma

### 3.1 Struktur file yang disarankan

Gunakan satu file Figma dengan halaman terurut:

1. `00 — Start here`: tujuan, pemilik, status keputusan, changelog, tautan dokumentasi.
2. `01 — Foundations`: warna, tipografi, grid, spacing, radius, elevation, icon, imagery.
3. `02 — Components`: komponen atomik dan komposit beserta variant/state.
4. `03 — Patterns`: navigasi, form, tabel, katalog, checkout, status pesanan, pengiriman.
5. `04 — Admin web`: layar dan prototipe admin desktop.
6. `05 — Storefront web`: layar dan prototipe toko di browser.
7. `06 — Customer mobile`: layar dan prototipe aplikasi pelanggan.
8. `07 — Admin mobile`: layar dan prototipe tugas operasional.
9. `08 — Archive`: eksplorasi lama yang tidak lagi dipakai; jangan letakkan komponen aktif di sini.

### 3.2 Penamaan dan pengelompokan

- Gunakan nama komponen berbahasa Inggris yang ringkas dan konsisten, misalnya `Button`, `Product Card`, `Order Status`, `Shipment Timeline`.
- Gunakan properti variant eksplisit: `Variant`, `Size`, `State`, `Icon`, `Platform`, `Delivery type`.
- Gunakan slash untuk grup: `Button/Primary`, `Field/Text`, `Navigation/Admin sidebar`.
- Gunakan nama token semantic alih-alih nama warna mentah pada layer UI: `text/primary`, `surface/page`, `action/primary`.
- Sufiks layar dengan ukuran/kanal jika membantu, misalnya `Storefront / Product detail / Desktop`.
- Satu komponen mempunyai satu sumber utama. Hindari duplikasi komponen dengan nama `final`, `new`, atau `copy`.

### 3.3 Modes dan variables

Mulai dengan mode `Light` untuk semua kanal. Buat collection variables:

- `Primitive`: nilai warna, jarak, ukuran, radius, dan elevation dasar.
- `Semantic`: warna peran UI, tipografi, dan surface yang memakai primitive.
- `Component`: hanya jika sebuah komponen memang memiliki token khusus dan digunakan berulang.

Jangan menambahkan mode dark sebelum kebutuhan dark mode disepakati dan diuji. Jika ditambahkan, semantic token tetap stabil sementara nilai per mode berubah.

## 4. Fondasi visual dan design tokens

### 4.1 Warna

Arah warna: kanvas putih dan netral dingin untuk menjaga rasa bersih serta tepercaya; biru sebagai aksi dan tautan. Warna status dilengkapi ikon/teks, tidak mengandalkan warna saja.

#### Primitive palette (rekomendasi)

| Token | Nilai | Penggunaan |
|---|---|---|
| `blue/50` | `#EFF6FF` | Latar sorotan lembut |
| `blue/100` | `#DBEAFE` | Latar info, pilihan aktif ringan |
| `blue/200` | `#BFDBFE` | Border sorotan |
| `blue/500` | `#3B82F6` | Aksen dekoratif, grafik |
| `blue/600` | `#2563EB` | Aksen brand dasar |
| `blue/700` | `#1D4ED8` | Aksi primer pada latar terang |
| `blue/800` | `#1E40AF` | Hover/link kuat |
| `blue/900` | `#1E3A8A` | Active/teks aksen gelap |
| `slate/25` | `#FCFCFD` | Surface sangat lembut |
| `slate/50` | `#F8FAFC` | Latar halaman sekunder |
| `slate/100` | `#F1F5F9` | Surface sunken/hover netral |
| `slate/200` | `#E2E8F0` | Border lembut |
| `slate/300` | `#CBD5E1` | Border kontrol |
| `slate/500` | `#64748B` | Teks sekunder |
| `slate/600` | `#475569` | Teks sekunder kuat |
| `slate/700` | `#334155` | Teks isi kuat |
| `slate/900` | `#0F172A` | Teks utama |
| `white` | `#FFFFFF` | Surface utama |
| `black` | `#000000` | Hindari untuk teks kecil; gunakan hanya bila diperlukan |

#### Semantic tokens

| Semantic token | Nilai awal | Aturan penggunaan |
|---|---|---|
| `surface/page` | `#FFFFFF` | Kanvas utama pelanggan dan admin |
| `surface/subtle` | `#F8FAFC` | Bagian halaman yang perlu dibedakan |
| `surface/raised` | `#FFFFFF` | Card, menu, dialog |
| `surface/selected` | `#EFF6FF` | Pilihan aktif |
| `border/default` | `#E2E8F0` | Garis pembatas ringan |
| `border/strong` | `#CBD5E1` | Batas input dan pemisah tegas |
| `text/primary` | `#0F172A` | Judul dan isi utama |
| `text/secondary` | `#475569` | Deskripsi dan metadata |
| `text/muted` | `#64748B` | Bantuan dan metadata sekunder |
| `text/disabled` | `#64748B` | Konten nonaktif; tetap terbaca pada latar terang |
| `text/inverse` | `#FFFFFF` | Teks pada aksi biru gelap |
| `action/primary` | `#1D4ED8` | Tombol primer, link penting |
| `action/primary-hover` | `#1E40AF` | Hover web |
| `action/primary-pressed` | `#1E3A8A` | Pressed/active |
| `action/secondary` | `#FFFFFF` | Tombol sekunder berbingkai |
| `focus/ring` | `#2563EB` | Focus ring yang terlihat |
| `status/success` | `#166534` | Teks/ikon sukses |
| `status/success-bg` | `#DCFCE7` | Latar sukses |
| `status/warning` | `#92400E` | Teks/ikon perhatian |
| `status/warning-bg` | `#FEF3C7` | Latar perhatian |
| `status/danger` | `#B91C1C` | Teks/ikon gagal atau destruktif |
| `status/danger-bg` | `#FEE2E2` | Latar gagal |
| `status/info` | `#1E40AF` | Teks/ikon informasi |
| `status/info-bg` | `#DBEAFE` | Latar informasi |
| `status/neutral` | `#475569` | Teks/ikon status netral |
| `status/neutral-bg` | `#F1F5F9` | Latar netral |

**Aturan kontras:** teks normal memenuhi rasio minimal WCAG AA 4.5:1 terhadap latar; teks besar minimal 3:1. Jangan gunakan `blue/500` untuk teks kecil di atas putih tanpa pemeriksaan kontras. Status sukses/peringatan/gagal/info selalu menampilkan label dan/atau ikon. Lakukan pemeriksaan kontras aktual pada kombinasi token sebelum handoff.

### 4.2 Tipografi

- Rekomendasi keluarga: **Inter**. Jika tidak tersedia pada lingkungan desain, gunakan sans-serif netral yang mendukung Bahasa Indonesia.
- Gunakan satu keluarga font untuk antarmuka. Hindari display font dekoratif untuk dashboard atau label transaksi.
- Harga menggunakan angka tabular jika tersedia; gunakan format lokal Rupiah konsisten, contoh `Rp1.250.000`.
- Body text tidak lebih kecil dari 14 px untuk konten penting; teks tambahan 12 px hanya untuk metadata yang tidak kritis.

| Style token | Size / line-height | Weight | Contoh penggunaan |
|---|---:|---:|---|
| `display/1` | 48 / 56 px | 700 | Headline promosi storefront desktop |
| `heading/1` | 36 / 44 px | 700 | Judul halaman utama |
| `heading/2` | 30 / 38 px | 700 | Judul halaman / bagian utama |
| `heading/3` | 24 / 32 px | 600 | Judul card besar / panel |
| `heading/4` | 20 / 28 px | 600 | Judul subsection |
| `title/large` | 18 / 26 px | 600 | Judul card/produk |
| `body/large` | 16 / 24 px | 400 | Isi utama |
| `body/default` | 14 / 22 px | 400 | Isi umum, tabel, form |
| `label/default` | 14 / 20 px | 500 | Label input dan kontrol |
| `body/small` | 12 / 18 px | 400 | Metadata sekunder |
| `button/default` | 14 / 20 px | 600 | Label tombol |
| `price/large` | 24 / 32 px | 700 | Harga detail / total checkout |

Di mobile, headline dapat turun satu langkah ukuran (misalnya `heading/1` menjadi 30/38 px). Jangan mengecilkan body text untuk memasukkan konten; susun ulang atau gunakan scroll.

### 4.3 Spacing dan ukuran

Gunakan basis 4 px. Token: `space/0 = 0`, `space/1 = 4`, `space/2 = 8`, `space/3 = 12`, `space/4 = 16`, `space/5 = 20`, `space/6 = 24`, `space/8 = 32`, `space/10 = 40`, `space/12 = 48`, `space/16 = 64`, `space/20 = 80`, `space/24 = 96`.

- Jarak antar elemen dalam kontrol: 8–12 px.
- Padding input/button horizontal: 12–16 px.
- Padding card: 16–24 px.
- Jarak antar section storefront: 48–80 px desktop, 32–48 px mobile.
- Jarak antar baris daftar admin: 12–16 px atau sesuai kepadatan tabel.
- Area sentuh minimal 44 × 44 px untuk kontrol mobile; icon kecil tetap dibungkus hit area yang cukup.

### 4.4 Radius, border, dan elevation

| Token | Nilai | Penggunaan |
|---|---:|---|
| `radius/xs` | 4 px | Label/status compact |
| `radius/sm` | 8 px | Input, tombol kecil |
| `radius/md` | 12 px | Card standar, tombol |
| `radius/lg` | 16 px | Panel, card produk |
| `radius/xl` | 24 px | Hero/overlay yang menonjol |
| `radius/full` | 999 px | Avatar, chip/pill |

- Border standar 1 px `border/default`; gunakan 2 px hanya untuk focus/selected state.
- Elevation rendah dan halus: card umumnya dibedakan oleh border; shadow disimpan untuk dropdown, popover, sticky bar, dan dialog.
- Modal desktop memakai shadow medium; bottom sheet mobile memakai pemisah/elevation yang cukup untuk menunjukkan lapisan.
- Hindari menumpuk border, shadow, dan latar berwarna sekaligus tanpa tujuan hierarki yang jelas.

### 4.5 Grid dan breakpoint

Ini adalah starting point untuk desain; validasi dengan konten dan perangkat uji.

| Ukuran | Frame Figma awal | Grid | Margin / gutter | Layout |
|---|---|---|---|---|
| Desktop wide | 1440 × 1000 | 12 kolom | 80 px / 24 px | Admin sidebar; storefront max-width 1200 px |
| Desktop | 1280 × 900 | 12 kolom | 48 px / 24 px | Admin sidebar 240–264 px |
| Tablet | 768 × 1024 | 8 kolom | 24 px / 16 px | Sidebar dapat menjadi drawer; katalog 2–3 kolom |
| Mobile | 390 × 844 | 4 kolom | 16 px / 16 px | Single column, bottom navigation bila sesuai |
| Mobile compact | 360 × 800 | 4 kolom | 16 px / 12 px | Uji overflow dan label panjang |

Breakpoint awal: mobile `< 768 px`, tablet `768–1023 px`, desktop `≥ 1024 px`. Web tetap fluid; breakpoint bukan pengganti layout constraints.

### 4.6 Iconografi dan ilustrasi

- Gunakan satu library icon outline konsisten dengan stroke sekitar 1.75–2 px.
- Ukuran standar: 16 px (inline), 20 px (kontrol), 24 px (navigasi), 32 px (empty state).
- Icon dekoratif tidak menggantikan label untuk tindakan yang tidak jelas.
- Gunakan ikon universal untuk cari, keranjang, profil, edit, hapus, filter, unduh, paket, dan status.
- Hindari logo teknologi starter (Expo/React/Vite) sebagai identitas toko.
- Ilustrasi empty state sederhana, netral, dan tidak menghambat pesan/action utama.

## 5. Perilaku responsif dan layout

### 5.1 Storefront web

- Header memiliki identitas toko, navigasi kategori, pencarian, akun, dan keranjang. Pertahankan satu primary action yang jelas.
- Gunakan container konten terbatas; katalog 4 kolom desktop besar, 3 kolom laptop, 2 kolom tablet, 2 atau 1 kolom mobile sesuai lebar kartu.
- Pada halaman detail produk, tampilkan gallery dan detail/CTA dalam dua kolom desktop; susun satu kolom mobile dan sediakan CTA sticky hanya bila tidak menutupi konten.
- Checkout: ringkasan tetap mudah diakses desktop; mobile gunakan ringkasan collapsible dan total/CTA yang terlihat.

### 5.2 Admin web

- Layout aplikasi dengan sidebar tetap/collapsible, topbar untuk judul/breadcrumb/aksi akun, dan area konten utama.
- Lebar sidebar awal 240–264 px; konten tabel tetap memiliki lebar minimum yang masuk akal.
- Tabel menggunakan header jelas, alignment angka kanan, kolom penting lebih dulu, filter/search, pagination, dan aksi baris yang tidak terlalu padat.
- Aksi destruktif dipisahkan dari aksi rutin dan memerlukan dialog konfirmasi.

### 5.3 Mobile

- Hormati safe area, keyboard, status bar, dan inset perangkat.
- Gunakan satu kolom; pindahkan tindakan sekunder ke menu atau bottom sheet.
- Hindari tabel horizontal sebagai satu-satunya cara membaca daftar; ubah menjadi list/card dengan informasi prioritas.
- Bottom navigation maksimal 4–5 item utama; layar detail dan alur checkout dapat menyembunyikannya bila perlu fokus.
- Gunakan sticky CTA dengan ruang aman agar tidak menutupi form, tombol sistem, atau konten terbawah.
- Dialog konfirmasi sederhana dapat menjadi native alert; form multi-field/operasional cocok untuk bottom sheet atau screen penuh.

## 6. Komponen dan aturan variant/state

Semua komponen interaktif minimal mempunyai `Default`, `Hover` (web), `Focused`, `Pressed`, `Disabled`, dan state validasi/loading sesuai kebutuhan. Gunakan component properties untuk menghindari kombinasi variant yang tidak terkontrol.

### 6.1 Komponen umum

| Komponen | Variant / ukuran | State dan catatan |
|---|---|---|
| `Button` | Primary, Secondary, Tertiary/Ghost, Destructive; sm/md/lg; icon leading/trailing | Default, hover, pressed, focus, disabled, loading; teks CTA berupa kata kerja |
| `Icon Button` | Subtle, outlined, filled; sm/md/lg | Wajib ada accessible name/tooltip; hit area mobile min 44 px |
| `Text Field` | Text, email, password, number, phone | Empty, filled, focus, error, success, disabled; label persisten di atas field |
| `Search Field` | Desktop inline / mobile expanded | Empty, typed, loading, no result; tombol clear tidak menghapus label |
| `Textarea` | Default / dengan counter | Focus, error, disabled; tunjukkan batas karakter bila ada |
| `Select / Combobox` | Single, searchable | Open, selected, empty, error; alternatif keyboard dan pembaca layar |
| `Checkbox` | Unchecked / checked / indeterminate | Focus, disabled; label bisa diklik |
| `Radio` | Unselected / selected | Group wajib memiliki legend/label |
| `Switch` | On / off | Gunakan untuk preferensi yang langsung tersimpan; bukan pengganti pilihan kritis |
| `Chip` | Filter, removable, category | Selected state dibedakan selain dengan warna |
| `Badge` | Status, count, category | Teks singkat; jangan pakai badge untuk paragraf |
| `Tabs` | Underline / pill | Tampilkan selected state dan jumlah jika relevan |
| `Tooltip` | Informasi singkat | Bukan tempat menyimpan instruksi wajib atau error |
| `Toast` | Success, info, warning, error | Ringkas, dapat diumumkan; error/action penting tidak hilang terlalu cepat |
| `Alert / Banner` | Info, success, warning, error | Untuk pesan kontekstual yang perlu tetap terlihat |
| `Dialog` | Confirm, form, notice | Judul jelas; destructive action menyebut objek yang terdampak |
| `Bottom Sheet` | Action list, filter, summary | Mobile; menyediakan close dan tidak mengunci aksi utama |
| `Pagination` | Compact / full | Tampilkan halaman aktif dan kontrol sebelumnya/berikutnya |
| `Skeleton` | Text, image, card, row | Samakan bentuk dengan konten akhir; jangan menjadi loading tanpa akhir |
| `Empty State` | No data, no search result, error/retry | Berisi sebab singkat dan satu tindakan berikutnya |
| `Price Text` | Regular, sale, total | Format IDR konsisten; diskon tidak boleh mengaburkan harga akhir |
| `Avatar` | Initial / image | Fallback inisial; bukan kontrol tanpa label |

### 6.2 Komponen e-commerce

- **Product card:** cover/image, nama, tipe pemenuhan, harga atau rentang varian, rating jika ada, badge promo bila valid, CTA/quick add hanya jika varian dapat dipilih dengan aman.
- **Product gallery:** thumbnail dan gambar utama; alt text tersedia; state gagal memuat menampilkan fallback, bukan layout rusak.
- **Delivery type selector:** pilihan digital/fisik selalu memiliki keterangan ringkas tentang cara menerima produk.
- **Variant selector:** label varian, harga, stok/availability; pilihan yang tidak tersedia dinonaktifkan dan menjelaskan alasannya.
- **Cart item:** thumbnail, nama/varian, tipe pemenuhan, harga snapshot saat ini, kuantitas, hapus, dan peringatan stok/harga bila berubah.
- **Voucher field:** input kode, apply/remove, feedback valid/tidak valid, dan potongan yang diterapkan; maksimal satu kode.
- **Order summary:** subtotal, diskon, biaya kirim (hanya untuk pesanan fisik jika berlaku), total; jangan menampilkan biaya kirim untuk digital-only.
- **Payment simulation panel:** status pembayaran, instruksi bahwa ini simulasi, aksi berhasil/gagal/kedaluwarsa sesuai prototype/test; jangan menyerupai checkout gateway nyata.
- **Digital delivery card:** nama item, status siap/tertahan, batas/expiry bila disediakan data, tombol unduh; tampilkan locked state sebelum pembayaran berhasil.
- **Shipment timeline:** kurir, nomor tracking, tahap terkini dan waktu; tampilkan hanya untuk order yang mengandung item fisik.
- **Review composer:** rating 1–5, komentar, kondisi kelayakan; hanya item yang sudah memenuhi kebijakan bisa diulas.

### 6.3 Komponen admin

- **Admin shell:** sidebar, mobile drawer/bottom nav sesuai prioritas, topbar, breadcrumb, content header/action.
- **Data table:** sorting/filter/search, row selection jika ada bulk action, status badge, skeleton, empty, error, pagination.
- **Filter bar:** status, date range, kategori/tipe, clear filter, jumlah hasil.
- **KPI card:** angka, label periode, perubahan hanya jika datanya tersedia; hindari grafik dekoratif.
- **Product editor:** section identitas, deskripsi, kategori, galeri gambar/alt text, varian dan tipe pemenuhan, harga, SKU, stok/berat kondisional, status publikasi.
- **Upload control:** drag/drop web dan native picker mobile; state upload/progress/success/failure/retry; jangan mengasumsikan file digital publik.
- **Order detail panel:** item snapshot, total, status pembayaran, status order, alamat yang relevan, pemenuhan digital/fisik sebagai section terpisah.
- **Shipment editor:** kurir/layanan, tracking number, tanggal kirim, status; validasi hanya untuk order fisik.
- **Destructive confirmation:** penghapusan/penonaktifan menyebut nama produk/kategori/voucher; berikan opsi batal yang mudah dijangkau.

## 7. Status dan microcopy produk

### 7.1 Pemetaan status

Label berikut menerjemahkan status PRD ke bahasa antarmuka; status backend tetap menjadi sumber kebenaran.

| Domain | Nilai data | Label UI | Semantic |
|---|---|---|---|
| Order | `pending_payment` | Menunggu pembayaran | Warning |
| Order | `paid` | Sudah dibayar | Success |
| Order | `processing` | Sedang diproses | Info |
| Order | `shipped` | Dalam pengiriman | Info |
| Order | `completed` | Selesai | Success |
| Order | `cancelled` | Dibatalkan | Neutral |
| Order | `expired` | Kedaluwarsa | Neutral / warning |
| Payment | `pending` | Menunggu pembayaran | Warning |
| Payment | `success` | Pembayaran berhasil | Success |
| Payment | `failed` | Pembayaran gagal | Danger |
| Payment | `expired` | Pembayaran kedaluwarsa | Neutral / warning |
| Shipment | `picked_up` | Paket diterima kurir | Info |
| Shipment | `in_transit` | Paket dalam perjalanan | Info |
| Shipment | `out_for_delivery` | Sedang diantar | Info |
| Shipment | `delivered` | Paket diterima | Success |
| Variant | `digital` | Produk digital | Info |
| Variant | `physical` | Produk fisik | Neutral |

Jangan menyamakan `paid` dengan `completed`: order fisik bisa masih diproses atau dikirim setelah pembayaran berhasil. Jangan menyediakan dropdown status bebas jika transisi dikendalikan backend.

### 7.2 Prinsip microcopy

- Bahasa antarmuka Bahasa Indonesia yang lugas dan tidak menyalahkan pengguna.
- CTA spesifik: `Lanjut ke pembayaran`, `Pilih alamat`, `Simpan produk`, bukan `Submit`.
- Error menyebut masalah dan cara memperbaiki: “Jumlah melebihi stok tersedia. Kurangi jumlah menjadi 2.”
- Empty state memberi konteks: “Belum ada pesanan” + aksi `Mulai belanja`.
- Pembayaran simulasi: “Pembayaran ini hanya simulasi untuk keperluan aplikasi. Tidak ada dana yang ditagihkan.”
- Digital locked: “File tersedia setelah pembayaran berhasil.”
- Jika harga/stok berubah, tampilkan apa yang berubah dan minta konfirmasi sebelum menyelesaikan order.
- Hindari pesan keberhasilan yang menyesatkan sebelum server mengonfirmasi operasi.

## 8. Peta kanal dan layar

Matriks berikut mengubah inventaris PRD menjadi backlog desain. Buat state normal, loading, empty, error, disabled, dan sukses untuk alur kritis.

### 8.1 Storefront web

**Navigasi:** header toko dengan kategori, pencarian, akun, keranjang; footer untuk informasi toko dan bantuan yang memang tersedia.

| Layar | Tujuan dan konten utama | State/variasi yang harus dirancang |
|---|---|---|
| Beranda dan katalog | Hero yang tidak menutupi produk, kategori, produk pilihan/terbaru, katalog dengan pagination | loading, kosong, error/retry |
| Pencarian dan filter | Pencarian nama/brand, kategori, hasil dan jumlah hasil | tidak ada hasil, filter aktif, clear |
| Detail produk | Gallery, nama/brand, rating, deskripsi, varian, jenis pemenuhan, harga, stok, ulasan, CTA | varian digital/fisik, tidak tersedia, review kosong |
| Registrasi | Nama, email, telepon, password, tanggal lahir jika diwajibkan PRD | validasi field, duplicate/conflict, sukses |
| Login | Email dan password, akses registrasi | kredensial gagal tanpa mengungkap keberadaan akun, loading |
| Keranjang | Item, tipe produk, kuantitas, hapus, subtotal, lanjut checkout | kosong, stok berubah, sesi login |
| Checkout dan alamat | Alamat hanya untuk pesanan fisik; review item dan ringkasan harga; voucher (P1) | digital-only, fisik, campuran, alamat kosong, voucher error |
| Pembayaran simulasi | Nomor order, jumlah, simulasi hasil pembayaran | pending, success, failed, expired |
| Riwayat dan detail pesanan | Snapshot order, payment, status; digital delivery dan tracking bila relevan | pending/paid, campuran, tidak punya akses |
| Profil dan buku alamat | Data profil dan CRUD alamat/default | data kosong, validasi, konfirmasi hapus |
| Ulasan produk | Rating, komentar, kelayakan review | eligible, sudah mengulas, tidak eligible |

### 8.2 Admin web

**Navigasi:** Ringkasan, Produk, Kategori, Pesanan, Voucher. Akses di menu dapat disesuaikan dengan hak akses/fitur yang benar-benar dirilis.

| Layar | Tujuan dan konten utama | State/variasi yang harus dirancang |
|---|---|---|
| Login admin | Autentikasi terpisah dari pelanggan | salah, loading, nonaktif/akses ditolak |
| Ringkasan operasional | Pesanan menunggu, pembayaran, pemenuhan fisik, produk stok rendah; shortcut ke antrean | tanpa data, periode/filter, error |
| Kategori | Daftar, pencarian, parent, tambah/edit | empty, kategori masih digunakan, konfirmasi |
| Produk | List/search/filter status dan tipe, tambah/edit produk | published/draft/nonaktif, stok rendah, empty |
| Editor produk/varian | Informasi produk, gambar/alt text, varian, SKU/harga, stok/berat kondisional | digital-only, physical, campuran, validasi/upload |
| Voucher | Daftar, buat/edit/nonaktif, masa berlaku dan batas | aktif, kedaluwarsa, pernah dipakai, invalid |
| Daftar pesanan | Pencarian, filter status/tanggal, ringkasan item dan jumlah | filter kosong, loading/error |
| Detail order/pembayaran | Snapshot order, payment simulation, status, item digital/physical | failed/expired/pending/success |
| Pengiriman/tracking | Isi kurir dan tracking, lihat histori tracking | hanya order fisik; shipped/delivered |

**Pola desktop:** sidebar konsisten; gunakan tabel untuk scan dan detail halaman untuk tindakan. Tampilkan KPI hanya bila angka memiliki definisi dan sumber yang jelas.

### 8.3 Customer mobile

**Navigasi utama:** `Beranda`, `Jelajahi`, `Keranjang`, `Pesanan`, `Akun`. Keranjang boleh memiliki count badge; jangan menaruh tab sekunder pada bar yang sama.

| Layar | Tujuan dan konten utama | Adaptasi mobile |
|---|---|---|
| Beranda | Pencarian, kategori, pilihan produk | komponen vertikal, carousel hanya jika tetap dapat diakses |
| Jelajahi/search | Search, filter, grid produk | filter dalam bottom sheet; hasil 2 kolom bila nyaman |
| Detail produk | Gallery, varian, harga, rating, CTA | pilihan varian mudah dijangkau; sticky CTA tidak menutupi konten |
| Login/registrasi | Akses akun pelanggan | keyboard type sesuai field; password visibility |
| Keranjang | Item dan subtotal | edit kuantitas inline; CTA checkout di area aman |
| Checkout | Pilih/tambah alamat jika ada fisik, voucher, total | step/section jelas; ringkasan collapsible; input besar |
| Pembayaran simulasi | Hasil simulasi dan jumlah | penjelasan simulasi terlihat sebelum aksi |
| Pesanan dan detail | Riwayat, timeline, unduhan, tracking | status ringkas; digital dan shipment jadi panel terpisah |
| Akun/alamat | Profil, alamat, logout | form satu kolom dan aksi berukuran sentuh |
| Ulasan | Rating dan komentar | keyboard-aware, feedback setelah simpan |

### 8.4 Admin mobile (operasional-prioritas)

Admin mobile tidak perlu menyalin seluruh desktop. Fokus pada melihat apa yang perlu dikerjakan dan menyelesaikan tindakan harian dengan aman.

**Navigasi awal:** `Ringkasan`, `Pesanan`, `Produk`, `Akun`; shipment menjadi filter/aksi dalam detail pesanan, bukan tab utama.

| Layar | Tujuan dan konten utama | Catatan desain |
|---|---|---|
| Login admin | Autentikasi admin khusus | tidak berbagi tampilan/identitas login pelanggan |
| Ringkasan | Antrean menunggu pembayaran, pesanan perlu diproses, pengiriman tertunda, stok rendah | angka membuka daftar terfilter; hindari KPI dekoratif |
| Daftar pesanan | Search, filter status, tanggal, jenis fulfillment | list-card dengan pelanggan/order/status/usia order; filter di sheet |
| Detail order | Item, status payment/order, jenis pemenuhan, informasi pelanggan minimum yang dibutuhkan | aksi sesuai transisi valid; data pribadi tidak berlebihan |
| Tindak lanjut pengiriman | Input kurir dan tracking, konfirmasi kirim, tracking history | hanya untuk order fisik; konfirmasi sebelum mengubah status |
| Produk ringkas | Cari produk, lihat harga/stok/status, quick edit stok/status bila aman | CRUD kompleks dan pengelolaan gambar penuh diarahkan ke admin-web |
| Notifikasi/inbox tugas (opsional) | Pengingat operasional yang berasal dari data nyata | jangan menjadi sistem notifikasi eksternal yang belum ada |

**Jangan masukkan pada mobile awal:** editor tabel massal, konfigurasi kategori bercabang yang kompleks, pengelolaan konten panjang, atau pengaturan voucher mendalam. Bila tetap diperlukan, arahkan admin ke admin-web; jangan menyembunyikan bahwa fungsi tersebut belum tersedia di mobile.

## 9. Alur lintas kanal yang harus diprototipekan

### 9.1 Pembelian digital murni

`Katalog → Detail → Pilih varian digital → Keranjang → Login bila perlu → Checkout tanpa alamat/ongkir → Pembayaran simulasi → Status berhasil → Unduhan tersedia`

Pastikan checkout tidak meminta alamat pengiriman, biaya kirim bernilai nol, dan tombol unduh baru aktif setelah pembayaran berhasil serta akses valid.

### 9.2 Pembelian fisik

`Katalog → Detail → Pilih varian fisik → Keranjang → Checkout dengan alamat → Pembayaran simulasi → Dibayar → Diproses → Dikirim + tracking → Diterima/selesai`

Alamat harus dapat dipilih; informasikan bahwa pengiriman/tracking dikelola manual. Jangan tampilkan ongkir real-time yang tidak didukung baseline.

### 9.3 Keranjang campuran

`Pilih varian digital dan fisik → Satu checkout → Alamat wajib untuk bagian fisik → Satu total dan pembayaran simulasi → Setelah sukses: unduhan dan pengiriman ditampilkan sebagai dua jalur`

Jangan membuat pelanggan menunggu barang fisik untuk memperoleh akses digital yang sudah berhak diterima.

### 9.4 Pembayaran gagal/kedaluwarsa

- Pertahankan referensi order dan tampilkan alasan/status dari sistem.
- Tawarkan hanya tindakan yang benar-benar didukung backend (misalnya mencoba kembali jika diizinkan).
- Jangan menampilkan unduhan aktif sebelum status pembayaran sukses.
- Bedakan status payment dari status fulfillment/order.

### 9.5 Alur kerja admin

`Ringkasan → Antrean order → Detail order → Periksa pembayaran dan item → Proses tindakan sesuai status → Untuk item fisik isi shipment/tracking → Pastikan status terlihat pada detail`

Perubahan status final mengikuti backend. Prototipe boleh mensimulasikan state tetapi tidak menetapkan transisi produk baru.

## 10. Aksesibilitas, error, dan state

### 10.1 Baseline aksesibilitas

- Target WCAG 2.1 AA sesuai PRD: cek rasio kontras, zoom/resize web, urutan heading dan semantik.
- Semua field memiliki label yang menetap, teks bantuan bila diperlukan, dan error yang terhubung secara visual.
- Web: dukung keyboard; fokus terlihat; menu/dialog memiliki fokus masuk-keluar yang logis.
- Mobile: label pembaca layar untuk icon-only; urutan fokus wajar; target sentuh memadai; dukung ukuran teks sistem.
- Jangan mengandalkan warna saja untuk status, selected, error, atau stok.
- Teks gambar produk punya alt text sesuai fungsi; gambar dekoratif tidak dibaca sebagai konten.
- Animasi non-esensial singkat dan tidak menyampaikan informasi tunggal; hormati reduced motion saat implementasi.

### 10.2 Checklist state setiap layar penting

Untuk setiap layar/alur penting, desain:

- Default dengan data realistis dan teks Bahasa Indonesia yang panjangnya wajar.
- Loading/skeleton dan proses submit.
- Empty state dan hasil pencarian nol.
- Error jaringan, validasi field, serta retry yang sesuai.
- Disabled state dengan alasan bila tindakan tidak tersedia.
- Success/confirmation setelah operasi dikonfirmasi server.
- Edge case: stok berubah, harga berubah, alamat tidak tersedia, order campuran, akses digital belum siap, dan shipment tidak berlaku.

### 10.3 Error dan aksi destruktif

- Validasi field ditampilkan dekat dengan field dan tidak hanya di toast.
- Simpan input ketika terjadi kegagalan jaringan bila aman dan mungkin.
- Konfirmasi hapus/nonaktifkan menamai objek yang dipengaruhi dan menyediakan `Batal`.
- Hindari konfirmasi untuk aksi rutin yang dapat dibatalkan; jangan menghapus histori order.
- Status pending harus menunjukkan bahwa proses belum selesai, bukan kesuksesan.

## 11. Konten, imagery, dan data contoh

- Gunakan contoh produk yang mewakili katalog digital seperti e-book, template, preset; produk fisik hanya jika varian tersebut benar-benar ada.
- Gunakan gambar cover dengan rasio konsisten pada katalog dan detail; tentukan art direction setelah aset produk tersedia.
- Harga dan angka memakai format IDR (`Rp` dan pemisah ribuan sesuai lokal Indonesia), kuantitas stok jelas, tanggal dalam format lokal yang disepakati.
- Nama produk, alamat, nomor order, dan deskripsi contoh harus realistis tetapi bukan data pelanggan sungguhan.
- Order campuran pada mockup harus terlihat jelas item mana yang diunduh dan item mana yang dikirim.
- Foto harus cukup terang dan tajam, latar tidak terlalu ramai; jangan memakai gambar placeholder sebagai indikasi brand final.

## 12. Prototipe dan prioritas desain

### 12.1 Urutan prototype Figma

1. **P0 pelanggan:** browse → detail → varian → cart → checkout → pembayaran simulasi berhasil/gagal → detail order.
2. **P0 admin:** login → ringkasan → daftar order → detail/pembayaran → tindakan status yang diizinkan.
3. **P0 unduhan:** paid/eligible → unduhan siap; pending/failed → locked state.
4. **P0 campuran:** checkout dengan alamat dan setelah dibayar memperlihatkan digital delivery plus shipping.
5. **P1:** buku alamat, voucher, kategori, reviews, shipment tracking lengkap, pengelolaan voucher.
6. **Admin mobile:** antrean order → detail → masukkan tracking; validasi cepat pada perangkat sempit.

### 12.2 Checklist kualitas sebelum handoff

- [ ] Istilah dan perilaku sesuai PRD final; tidak memperkenalkan marketplace/payment gateway/ongkir otomatis.
- [ ] Empat kanal terpetakan dan setiap layar kritis memiliki alur masuk/keluar.
- [ ] Digital, fisik, dan campuran dibedakan dalam katalog, cart, checkout, order detail, dan admin.
- [ ] Status order, payment, dan shipment dibedakan; label UI tidak menampilkan kode backend.
- [ ] Token semantic dipakai konsisten; kontras diperiksa pada kombinasi foreground/background.
- [ ] Komponen punya variant/state yang diperlukan dan nama Figma konsisten.
- [ ] Desktop, tablet, mobile compact, dan mobile target diuji untuk overflow.
- [ ] Data contoh tidak mengandung data pribadi sungguhan.
- [ ] Komponen/prototipe mengomunikasikan state loading, empty, error, disabled, dan sukses.
- [ ] Fitur yang belum tersedia tidak digambarkan seolah-olah sudah beroperasi.

## 13. Handoff ke implementasi

Untuk handoff, sertakan:

1. Link ke file Figma dan halaman `Start here`.
2. Daftar keputusan final versus rekomendasi yang belum disetujui (warna brand, font final, breakpoint).
3. Link prototype untuk empat alur prioritas pada bagian 12.1.
4. Nama semantic variables, component properties, status colors, dan aturan format harga.
5. Catatan responsive, keyboard/focus, touch target, empty/error states, serta perilaku conditional digital/fisik.
6. Catatan bahwa backend adalah sumber validasi harga, stok, izin unduhan, dan transisi status.
7. Daftar gap API/data yang memengaruhi desain; jangan menyelesaikannya dengan fallback UI yang menyesatkan.

## 14. Referensi internal yang digunakan

- `../PRD/PRD_Final_Fixed.md` — sumber baseline perilaku produk, fitur, inventaris halaman, status, aksesibilitas.
- `../analisis.md` — konteks awal sistem dan basis data.
- `../ARC/Architecture.md` — pemisahan empat kanal dan tanggung jawab arsitektur.
- `../../packages/design-tokens/src/` — target paket token yang saat diperiksa belum memiliki isi.
- `../../packages/design-system/src/` dan `../../packages/ui/src/` — target paket UI yang saat diperiksa belum memiliki isi.
- `../../apps/admin-web/src/App.jsx`, `../../apps/storefront-web/src/App.jsx`, `../../apps/admin-mobile/src/app/index.tsx`, `../../apps/customer-mobile/src/app/index.tsx` — starter UI yang saat diperiksa belum mengimplementasikan produk InahuyShop.
