# Analisis Sistem & Perancangan Basis Data Inahuy.Shop

Dokumen ini berisi analisis kebutuhan sistem dan perancangan basis data untuk platform e-commerce **Inahuy.Shop** pada mata kuliah Basis Data A.

---

## 1. Kebutuhan Sistem

Inahuy.Shop merupakan platform jual-beli yang berfokus pada **produk digital** (seperti e-book, template, preset, file desain) sekaligus mendukung penjualan **produk fisik** (seperti versi cetak buku atau merchandise). 

Sistem ini memfasilitasi tiga entitas utama:
* **Pelanggan:** Memilih produk (digital/fisik), mengisi alamat pengiriman (jika membeli barang fisik), melakukan pembayaran, serta mendapatkan akses link unduhan untuk produk digital.
* **Penjual (Merchant):** Mengunggah file untuk produk digital, mengatur stok/berat untuk produk fisik, menentukan harga, dan memantau status pesanan.
* **Admin:** Mengelola kategori, data akun pengguna, serta memantau arus transaksi platform.

---

## 2. Entitas dan Atribut Utama

Berdasarkan alur kebutuhan di atas, struktur data yang dirancang meliputi:

* **Users:** `id_user`, `nama`, `email`, `password`, `no_hp`, `role` (admin/penjual/pelanggan), `created_at`
* **Categories:** `id_kategori`, `nama_kategori`, `slug`
* **Products:** `id_produk`, `id_penjual`, `id_kategori`, `nama_produk`, `tipe_produk` (digital/fisik), `harga`, `stok` (khusus fisik), `berat_gram` (khusus fisik), `file_path` (khusus digital), `deskripsi`
* **Orders:** `id_order`, `id_pelanggan`, `tgl_order`, `total_harga`, `status_pembayaran`, `alamat_pengiriman` (khusus transaksi fisik), `resii_pengiriman`
* **Order_Items:** `id_item`, `id_order`, `id_produk`, `harga_satuan`, `jumlah`
* **Digital_Downloads:** `id_download`, `id_order`, `id_produk`, `token_akses`, `sisa_unduhan`, `expired_at`

---

## 3. Relasi & Aturan Bisnis (Business Rules)

1. **Fleksibilitas Produk:** Kolom `tipe_produk` membedakan penanganan logika di sistem. Jika produk tipe *digital*, atribut `stok` diabaikan (dianggap unlimited) dan `file_path` wajib diisi. Jika tipe *fisik*, atribut `stok` dan `berat_gram` wajib diisi.
2. **Penanganan Transaksi Hibrida:** Satu transaksi (`Orders`) bisa berisi kombinasi produk fisik dan digital.
3. **Akses Unduhan Otomatis:** Tabel `Digital_Downloads` akan meng-generate *token_akses* secara otomatis hanya setelah `status_pembayaran` di tabel `Orders` terverifikasi *Paid/Lunas*.
4. **Pengiriman Barang Fisik:** Alamat pengiriman dan nomor resi hanya diproses jika dalam pesanan terdapat minimal satu produk bertipe *fisik*.
