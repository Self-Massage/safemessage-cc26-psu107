# Processed Dataset

Folder ini berisi dataset hasil proses data wrangling yang sudah bersih 
dan siap digunakan untuk training model TextCNN.

## Daftar File Output

| File | Deskripsi |
|------|-----------|
| `dataset_phishing_sms_indo.csv` | Dataset gabungan dari 3 sumber, sudah di-cleaning dan dilabeli binary (0/1) |
| `dataset_train.csv` | Data training (hasil stratified split) |
| `dataset_val.csv` | Data validasi (hasil stratified split) |
| `dataset_test.csv` | Data testing (hasil stratified split) |

## Proses yang Sudah Dilakukan

| Tahap | Keterangan |
|-------|-----------|
| Gathering | Menggabungkan 3 dataset dari GitHub Gist, GitHub bopbi, dan Kaggle |
| Label Mapping | Memetakan label asli ke binary: `1` (phishing) dan `0` (normal) |
| Assessing | Cek missing values, duplikat, inkonsistensi format |
| Cleaning | Hapus duplikat, filter bahasa Indonesia via `langdetect`, normalisasi teks |
| Preprocessing | Lowercase, hapus karakter spesial, stopword removal, stemming (PySastrawi) |
| Splitting | Stratified split → train / val / test |

## Statistik Dataset (Setelah Cleaning)

| Sumber | Jumlah Awal | Keterangan |
|--------|-------------|-----------|
| GitHub Gist (yudiwbs) | ~1.143 baris | Label: normal / penipuan / promo |
| GitHub (bopbi) | ~288 baris | Label: prize / loan / evil-service / dll |
| Kaggle (gevabriel) | ~2.636 baris | Label: spam / ham |

## Cara Mendapatkan File Ini
File ini dihasilkan otomatis setelah menjalankan: Notebook/01_Data_Wrangling. Jalankan dari awal sampai akhir, pastikan dataset raw sudah tersedia di folder `Dataset/Raw/`.
