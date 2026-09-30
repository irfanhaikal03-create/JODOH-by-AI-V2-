# ❤️ JODOH by A.I

> **Sistem Padanan Jodoh Pintar Eksekutif untuk Penganjur Acara & Pengendali Temuduga Cinta**  
> Dikuasakan oleh Google Gemini AI, Firebase Firestore & Authentication, React 19, TypeScript, dan Tailwind CSS.

---

## 🔗 Pautan Rasmi Projek

- 🌐 **Google AI Studio App**: [https://ai.studio/apps/e175b9ac-8c2d-4a4a-b3e1-151b8b9312bd](https://ai.studio/apps/e175b9ac-8c2d-4a4a-b3e1-151b8b9312bd)
- 🐙 **GitHub Repository**: [https://github.com/irfanhaikal03-create/JODOH-by-AI-V2-](https://github.com/irfanhaikal03-create/JODOH-by-AI-V2-)

---

## 📖 Apa Itu JODOH by A.I?

**JODOH by A.I** ialah platform moden yang direka khas untuk penganjur acara *speed-dating*, perunding jodoh, dan pengurus komuniti.

Aplikasi ini memudahkan penganjur mengurus profil peserta (lelaki & wanita) dan menggunakan kepintaran buatan (**Google Gemini AI**) untuk menghasilkan **padanan eksklusif 1-lawan-1**. Setiap peserta hanya akan dipadankan dengan seorang pasangan terbaik tanpa sebarang pertindihan (*zero overlap*).

---

## ✨ Ciri-Ciri Utama

### 1. 📋 Pengurusan Profil Peserta (Kolam Calon)
- **Profil Lengkap**: Simpan maklumat nama, umur, jantina, pekerjaan, lokasi, status perkahwinan, tabiat merokok, hobi, dan kriteria pasangan idaman.
- **Gambar & Avatar**: Boleh muat naik gambar profil atau URL, dengan sokongan avatar monogram automatik jika tiada gambar.
- **Carian & Tapis Pantas**: Cari peserta mengikut nama, bandar, pekerjaan, atau minat dalam masa nyata.
- **Mod Glimpse Peserta**: Paparan khusus untuk peserta melihat ringkasan calon-calon lain secara selamat.

### 2. 🤖 Enjin Pemadanan Pintar (Gemini AI)
- **Padanan 1-ke-1 Eksklusif**: Algoritma memastikan setiap peserta hanya dipadankan dengan seorang pasangan sahaja.
- **Skor Keserasian Pelbagai Vektor**: Menilai keserasian berdasarkan jurang umur, lokasi geografi, gaya hidup, nilai murni, kerjaya, dan hobi yang dikongsi.
- **Ulasan Mendalam oleh AI**:
  - **Sebab Serasi**: Kenapa pasangan ini sesuai bersama.
  - **Potensi Cabaran**: Perkara yang perlu diberi perhatian atau toleransi.
  - **Cadangan Aktiviti Temu Janji**: Idea *ice-breaking* dan tarikh pertama yang disesuaikan mengikut hobi bersama.

### 3. 💬 AI Dating Wingman (Masa Nyata Khas Peserta)
- **Akses AI Semasa Dating**: Peserta boleh berinteraksi dengan AI Wingman secara masa nyata sewaktu menjalankan aktiviti temu janji.
- **Kawalan Ketat (Strict Partner-Only Lock)**: AI hanya membenarkan bimbingan dan pertanyaan mengenai **pasangan rasmi yang telah dipadankan sahaja**. Pertanyaan mengenai orang lain akan ditolak secara beradab.
- **Soalan & Icebreaker Spontan**: AI mencadangkan soalan menceriakan suasana berdasarkan hobi dan profil pasangan.
- **Recap Perjalanan Dating**: Peserta boleh mencatat nota dan meminta AI merumuskan sentimen, *green flags*, dan cadangan untuk *date* seterusnya.
- **Kad Aktiviti Interaktif (Swipe & React)**: Boleh leret (*swipe*), simpan, atau tanda selesai aktiviti dating bersama pasangan.

### 4. 📁 Arkib Sesi & Kawalan Terbitan (Draf vs Terbit)
- **Simpan Sesi Padanan**: Simpan pelbagai sesi larian pemadanan dalam arkib aplikasi.
- **Status Draf & Terbit**: Admin boleh menyemak keputusan terlebih dahulu secara tertutup (Draf) sebelum menerbitkannya kepada peserta.
- **Kawalan Admin Penuh**: Hanya pentadbir yang disahkan boleh menjana, memadam, atau menetapkan semula data sistem.

### 4. 📄 Eksport Laporan Rasmi (PDF & CSV)
- **Draf PDF Eksekutif**: Jana dan muat turun dokumen PDF rasmi laporan padanan lengkap untuk arkib atau cetakan fizikal.
- **Pratonton Cetakan**: Boleh semak dan cetak terus dari pelayar web (*Print to PDF*).
- **Eksport CSV**: Muat turun senarai padanan dalam format hamparan (*Excel/Sheets*).

### 5. ☁️ Keselamatan & Integrasi Firebase Cloud
- **Log Masuk Google**: Akses pantas dan selamat menggunakan akaun Google.
- **Firebase Firestore**: Simpanan awan masa nyata (*real-time sync*) dengan perlindungan keselamatan berasaskan peranan (RBAC).
- **Sokongan Luar Talian (Offline)**: Aplikasi tetap berfungsi menggunakan simpanan tempatan (*LocalStorage*) sekiranya tiada sambungan internet.

---

## 🛠️ Teknologi Yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Motion |
| **Bahasa** | TypeScript |
| **Model AI** | Google Gen AI SDK (`@google/genai` / Gemini 2.5 Flash) |
| **Pangkalan Data & Auth** | Firebase Firestore & Google Firebase Auth |
| **Backend / Pelayan** | Express.js & TSX (Node.js) |
| **Penjanaan PDF** | jsPDF |
| **Ikon & Tipografi** | Google Fonts (Playfair Display, Plus Jakarta Sans, Material Symbols) |

---

## 🚀 Panduan Memulakan Projek (Langkah Demi Langkah)

### Keperluan Awal
Pastikan komputer anda sudah dipasang dengan:
1. **Node.js** (Versi 18 ke atas) - [Muat Turun Node.js](https://nodejs.org/)
2. **Git** - [Muat Turun Git](https://git-scm.com/)
3. **Kunci API Gemini** - Dapatkan secara percuma di [Google AI Studio](https://aistudio.google.com/)

---

### Cara Pemasangan

#### 1. Klon Repositori
Buka terminal / Command Prompt dan jalankan:
```bash
git clone https://github.com/irfanhaikal03-create/JODOH-by-AI-V2-.git
cd JODOH-by-AI-V2-
```

#### 2. Pasang Dependensi
```bash
npm install
```

#### 3. Tetapkan Fail Konfigurasi `.env`
Salin fail `.env.example` kepada `.env`:
```bash
cp .env.example .env
```
Buka fail `.env` dan masukkan kunci API Gemini anda:
```env
GEMINI_API_KEY="masukkan_kunci_api_gemini_anda_di_sini"
PORT=3000
```

#### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka pelayar web (*browser*) anda dan layari:
👉 **`http://localhost:3000`**

---

## 📜 Senarai Perintah Skrip (Scripts)

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan pelayan pembangunan (*development server*) |
| `npm run build` | Menghasilkan binaan pengeluaran (*production build*) ke folder `dist/` |
| `npm start` | Menjalankan pelayan mod pengeluaran |
| `npm run lint` | Menyemak ralat kod TypeScript |

---

## 🗂️ Struktur Fail Utama

```text
├── index.html                  # Fail utama HTML & fon antaramuka
├── server.ts                   # Pelayan Express & integrasi API Google Gemini
├── firestore.rules             # Peraturan keselamatan Firebase Firestore
├── firebase-blueprint.json     # Skema struktur data pangkalan data
├── firebase-applet-config.json # Konfigurasi projek Firebase
├── src/
│   ├── main.tsx                # Titik mula React
│   ├── App.tsx                 # Logik utama aplikasi, navigasi & pengurusan data
│   ├── firebase.ts             # Inisialisasi Firebase Auth & Firestore
│   ├── types.ts                # Takrifan jenis data (Participant, MatchResult, dll.)
│   ├── index.css               # Gaya Tailwind CSS & reka bentuk tema
│   ├── data/
│   │   └── initialData.ts      # Data contoh calon peserta permulaan
│   └── components/
│       ├── Header.tsx          # Bar atas aplikasi & status enjin
│       ├── Sidebar.tsx         # Menu navigasi sisi (Desktop & Mobile)
│       ├── ParticipantsPoolView.tsx # Paparan senarai calon peserta
│       ├── TopMatchesView.tsx  # Paparan senarai Top 10 padanan AI
│       ├── AddEditParticipantModal.tsx # Borang tambah/edit calon
│       ├── SavedSessionsModal.tsx # Pengurusan arkib sesi padanan
│       ├── DossierPreviewModal.tsx # Pratonton & cetakan PDF
│       └── AdminResetModal.tsx # Dialog tetapan semula data admin
└── README.md                   # Dokumentasi panduan projek
```

---

## 🔒 Privasi & Keselamatan Data

- **Kunci API Selamat**: Kunci API Google Gemini disimpan di bahagian pelayan (*server-side*) dan tidak didedahkan kepada pelayar pengguna.
- **Peraturan Keselamatan Firestore**: Data dilindungi dengan kawalan berasaskan peranan (RBAC) di mana hanya pentadbir yang disahkan boleh mengubah keputusan pemadanan rasmi.
- **Sandaran Tempatan**: Data peserta kekal selamat disimpan pada peranti pengguna melalui simpanan tempatan walaupun pangkalan data awan terputus.

---

## 📄 Lesen

Projek ini dilesenkan di bawah lesen **Apache License 2.0**.
