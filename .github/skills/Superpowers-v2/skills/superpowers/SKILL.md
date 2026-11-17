---
name: 'superpowers'
description: Disiplin kerja rekayasa perangkat lunak berbasis proses (Superpowers) — gunakan setiap kali user membangun fitur/komponen/aplikasi baru, merencanakan sesuatu, memperbaiki bug/test gagal/error, menulis atau menjalankan implementation plan, melakukan code review (meminta atau menerima), menulis test/TDD, memakai git worktree, menyelesaikan atau merge branch, menyatakan pekerjaan "selesai/berhasil/lolos", menjalankan beberapa tugas paralel dengan subagent, atau menulis/mengedit skill. Pakai juga ketika user menyebut "superpowers", brainstorming, systematic debugging, TDD, plan, review, verifikasi sebelum klaim selesai, atau worktree, meskipun tidak meminta skill secara eksplisit.
---

# Superpowers (paket 15 skill dalam satu skill)

Skill ini adalah **router**. Isi aslinya (15 skill Superpowers) ada di `skills/<nama>/GUIDE.md`. Tugasmu: pilih panduan yang relevan, **baca file GUIDE.md-nya sampai habis**, lalu ikuti persis. Jangan mengandalkan ingatan tentang isinya.

Di dalam panduan, penulisan `superpowers:<nama>` berarti: baca `skills/<nama>/GUIDE.md`. Link relatif antar panduan (mis. `../requesting-code-review/code-reviewer.md`) tetap valid karena struktur folder dipertahankan. Skrip dijalankan lewat interpreter, mis. `bash skills/<nama>/scripts/<skrip>`.

## Aturan inti

Jika ada kemungkinan panduan berlaku pada tugas, baca panduannya **sebelum** merespons atau bertindak, termasuk sebelum bertanya klarifikasi atau menjelajah kode. Umumkan singkat: "Memakai [panduan] untuk [tujuan]", lalu ikuti. Jika panduan punya checklist, buat satu todo per item. Instruksi eksplisit user (CLAUDE.md, AGENTS.md, permintaan langsung) selalu mengalahkan panduan.

Jika kamu dijalankan sebagai subagent untuk satu tugas spesifik, abaikan aturan "baca dulu" ini dan kerjakan tugasmu.

Panduan proses didahulukan (menentukan pendekatan), baru panduan implementasi:

- "Mari bangun X" → `brainstorming`, lalu `writing-plans`, lalu eksekusi.
- "Perbaiki bug ini" → `systematic-debugging`, lalu `test-driven-development`.

## Peta pemilihan

| Situasi                                                                      | Baca                                                            |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Mulai kerja kreatif: fitur, komponen, perubahan perilaku, rencana apa pun    | `skills/brainstorming/GUIDE.md` (visual: `visual-companion.md`) |
| Sudah punya spec/requirement multi-langkah, belum menyentuh kode             | `skills/writing-plans/GUIDE.md`                                 |
| Menjalankan plan sendiri di sesi ini (inline / tanpa subagent)               | `skills/executing-plans/GUIDE.md`                               |
| Menjalankan plan dengan tugas independen via subagent                        | `skills/subagent-driven-development/GUIDE.md`                   |
| 2+ tugas independen tanpa state bersama                                      | `skills/dispatching-parallel-agents/GUIDE.md`                   |
| Perlu isolasi dari workspace saat ini sebelum mulai fitur                    | `skills/using-git-worktrees/GUIDE.md`                           |
| Implementasi fitur atau bugfix                                               | `skills/test-driven-development/GUIDE.md`                       |
| Bug, test gagal, perilaku tak terduga (sebelum mengusulkan fix)              | `skills/systematic-debugging/GUIDE.md`                          |
| Selesai tugas/fitur besar, sebelum merge                                     | `skills/requesting-code-review/GUIDE.md`                        |
| Menerima feedback review                                                     | `skills/receiving-code-review/GUIDE.md`                         |
| Akan menyatakan "selesai/fixed/lolos", commit, atau buat PR                  | `skills/verification-before-completion/GUIDE.md`                |
| Implementasi selesai, test lulus, putuskan cara integrasi (merge/PR/cleanup) | `skills/finishing-a-development-branch/GUIDE.md`                |
| Membuat/mengedit/menguji skill                                               | `skills/writing-skills/GUIDE.md`                                |
| Sesi Superpowers bermasalah, ingin tahu sebabnya atau bikin bug report       | `skills/diagnosing-superpowers/GUIDE.md`                        |
| Cara memakai skill, prioritas, rasionalisasi yang harus dihindari            | `skills/using-superpowers/GUIDE.md`                             |

Jika beberapa baris cocok, baca semuanya dan terapkan berurutan (proses dulu, implementasi kemudian).

## Adaptasi platform

Panduan ditulis dengan kosakata Claude Code (`Agent` untuk subagent, todo, dll.). Di claude.ai/Cowork atau harness lain, cek dulu tool yang benar-benar tersedia:

- Catatan per harness: `skills/using-superpowers/references/` (`claude-code-tools.md`, `codex-tools.md`, `gemini-tools.md`, `pi-tools.md`, `antigravity-tools.md`, `hermes-tools.md`, `muse-tools.md`).
- Tanpa subagent: pakai `executing-plans` (inline), bukan `subagent-driven-development`.
- Tanpa akses git/repo user: terapkan prinsip panduan (mis. verifikasi sebelum klaim, root cause sebelum fix) dan katakan terus terang langkah mana yang tidak bisa dijalankan.

## Red flags (berhenti, kamu sedang merasionalisasi)

"Ini cuma pertanyaan sederhana", "perlu konteks dulu", "jelajahi kode dulu", "saya ingat isi panduannya", "ini overkill", "satu hal ini dulu". Semuanya berarti: baca panduan yang relevan dulu.
