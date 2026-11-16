# Panduan Kontribusi

## Sebelum mulai

- Diskusikan perubahan besar melalui issue terlebih dahulu.
- Pastikan perubahan sesuai ruang lingkup dan tidak menambahkan
  dependency lintas layer tanpa alasan yang jelas.
- Jangan memasukkan kredensial, data pribadi, hasil build, atau file
  lokal ke commit.

## Siapkan lingkungan

1. Gunakan Node.js 22 dan pnpm 12.16.1.
2. Jalankan `pnpm install --frozen-lockfile`.
3. Untuk perubahan API/MySQL, ikuti perintah Docker Compose yang
   tercantum di README.

## Validasi perubahan

Sebelum membuka pull request, jalankan:

```bash
pnpm verify
```

Tambahkan atau perbarui pengujian yang relevan untuk perubahan
perilaku. Untuk perubahan container, validasi build image dan
`docker compose up --wait`, lalu pastikan API health endpoint merespons.

## Pull request

- Buat branch pendek dari branch kerja yang ditentukan issue.
- Berikan judul dan deskripsi yang menjelaskan alasan serta dampak
  perubahan.
- Tandai seluruh pemeriksaan pada template pull request secara jujur.
- Pastikan CI lulus dan tanggapi review sebelum meminta merge.
- Jangan memasukkan perubahan lokal yang tidak terkait.

## Gaya perubahan

- Ikuti format Prettier, aturan ESLint, dan pola package yang sudah ada.
- Gunakan JavaScript/JSX untuk web dan API; pertahankan TypeScript pada
  aplikasi Expo/React Native.
- Jaga boundary UI web dan native serta dependency package sesuai
  pemeriksaan repository.
