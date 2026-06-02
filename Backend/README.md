# 🚀 Smishing Detection Backend (API & Database)

Backend ini dibangun menggunakan **Node.js (ES Modules)**, **Express.js**, **Prisma ORM**, dan database **PostgreSQL** dengan arsitektur modular yang rapi dan mematuhi best-practice pengembangan RESTful API.

---

## 🛠️ Persyaratan Sistem (Prerequisites)

Sebelum menjalankan backend ini, pastikan Anda memiliki:
1. **Node.js** (Versi 18 ke atas)
2. **PostgreSQL** yang berjalan secara lokal atau online (seperti Neon.tech, Supabase, dll.)

---

## ⚙️ Cara Setup dan Menjalankan

### 1. Inisialisasi Environment Variables (`.env`)
Buka file `.env` di folder root backend ini (`d:\dicoding-backend\.env`) dan sesuaikan konfigurasi koneksi database Anda:

```env
PORT=5000
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>?schema=public"
JWT_SECRET="masukkan-kunci-rahasia-jwt-anda"
HF_API_URL="https://hafi1-smishing-detection-api.hf.space/api/v1/predictions"
```

*Contoh jika menggunakan database lokal PostgreSQL:*
`DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/smishing_db?schema=public"`

---

### 2. Jalankan Migrasi Database
Untuk menyinkronkan skema database Prisma ke database PostgreSQL Anda dan membuat semua tabel otomatis (`User`, `History`, `Feedback`), jalankan perintah berikut di terminal:

```bash
npx prisma migrate dev --name init
```

*Perintah di atas akan membaca file `.env` Anda, menghubungi database PostgreSQL, membuat database dan tabel-tabelnya, serta men-generate tipe data Prisma Client.*

---

### 3. Jalankan Server Backend

*   **Mode Development (dengan auto-reload):**
    ```bash
    npm run dev
    ```
*   **Mode Production:**
    ```bash
    npm start
    ```

Setelah berhasil dijalankan, server akan aktif di **`http://localhost:5000`**. Anda bisa mengecek kesehatannya di browser dengan membuka `http://localhost:5000/health`.

---

## 📊 Membuka Database Studio (Prisma Studio)
Prisma menyediakan GUI keren untuk melihat, menambah, mengedit, atau menghapus entri data di database PostgreSQL Anda secara visual. Jalankan perintah ini:

```bash
npx prisma studio
```
Browser akan membuka dashboard visual di alamat `http://localhost:5555`.

---

## 📌 Dokumentasi Endpoint API (`v1`)

### 🔑 Autentikasi Pengguna (`/api/v1/auth`)

1. **Register (Buat Akun Baru)**
   * **Endpoint:** `POST /api/v1/auth/register`
   * **Body (JSON):**
     ```json
     {
       "name": "Nama Lengkap",
       "email": "nama@email.com",
       "password": "password123"
     }
     ```
   * **Respons:** Akun baru dibuat + mengembalikan Token JWT.

2. **Login (Masuk Akun)**
   * **Endpoint:** `POST /api/v1/auth/login`
   * **Body (JSON):**
     ```json
     {
       "email": "nama@email.com",
       "password": "password123"
     }
     ```
   * **Respons:** Login sukses + mengembalikan Token JWT.

3. **Get Profile (Dapatkan Profil Pengguna Aktif)**
   * **Endpoint:** `GET /api/v1/auth/me`
   * **Headers:** `Authorization: Bearer <TOKEN_JWT>`
   * **Respons:** Informasi profil user yang sedang login.

---

### 🔍 Deteksi SMS Phishing (`/api/v1/predictions`)

1. **Check SMS Message (Proxy AI & Save History)**
   * **Endpoint:** `POST /api/v1/predictions/check`
   * **Headers:** `Authorization: Bearer <TOKEN_JWT>`
   * **Body (JSON):**
     ```json
     {
       "message": "Selamat! Anda terpilih mendapatkan hadiah Rp 50.000.000."
     }
     ```
   * **Respons:** Meneruskan data ke AI Model, menormalisasi hasil prediksi, mencatat otomatis ke tabel `History` di PostgreSQL, dan mengembalikan hasil ke pengguna.

---

### ⏳ Riwayat Deteksi (`/api/v1/history`)

1. **Get All History (Dapatkan Semua Riwayat User Aktif)**
   * **Endpoint:** `GET /api/v1/history`
   * **Headers:** `Authorization: Bearer <TOKEN_JWT>`
   * **Respons:** List riwayat pengecekan user.

2. **Clear History (Hapus Semua Riwayat User Aktif)**
   * **Endpoint:** `DELETE /api/v1/history`
   * **Headers:** `Authorization: Bearer <TOKEN_JWT>`

3. **Get Stats (Ambil Statistik Deteksi)**
   * **Endpoint:** `GET /api/v1/history/stats`
   * **Headers:** `Authorization: Bearer <TOKEN_JWT>`
   * **Respons:** `{ totalCount: X, safeCount: Y, phishingCount: Z }`

---

### 💬 Masukan Pengguna (`/api/v1/feedbacks`)

1. **Submit Feedback (Kirim Masukan)**
   * **Endpoint:** `POST /api/v1/feedbacks`
   * **Headers (Opsional):** `Authorization: Bearer <TOKEN_JWT>`
   * **Body (JSON):**
     ```json
     {
       "rating": 5,
       "comment": "Aplikasi ini sangat membantu!"
     }
     ```
   * **Respons:** Feedback berhasil disimpan. Jika pengguna menyertakan JWT token, feedback akan otomatis dihubungkan dengan akun pengguna tersebut.
