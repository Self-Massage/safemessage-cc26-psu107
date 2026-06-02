# Notebook

Folder ini berisi seluruh kode tim Data Science, mulai dari data wrangling, EDA, A/B Testing, hingga dashboard visualisasi.

## Daftar File & Folder

| File/Folder | Deskripsi |
|-------------|-----------|
| `data_wrangling.ipynb` | Proses gathering, assessing, dan cleaning dataset |
| `eda.ipynb` | Exploratory Data Analysis: distribusi kelas, wordcloud, frekuensi kata |
| `ab_testing.ipynb` | A/B Testing antar konfigurasi model TextCNN |
| `dashboard/` | Kode Streamlit untuk visualisasi EDA dan monitoring model |

## Urutan Pengerjaan
Jalankan notebook sesuai urutan berikut:
1. `data_wrangling.ipynb` → menghasilkan dataset processed
2. `eda.ipynb` → membutuhkan output dari data wrangling
3. `ab_testing.ipynb` → membutuhkan model dari tim AI
4. `dashboard/app.py` → membutuhkan output dari EDA dan model

## Prerequisites
Pastikan sudah install semua library yang dibutuhkan:
```
pip install -r ../requirements.txt
```
