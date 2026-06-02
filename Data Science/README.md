# Notebook — SafeMessage Data Science

Folder ini berisi seluruh kode tim Data Science, mulai dari data wrangling, EDA, dashboard visualisasi, hingga A/B Testing model TextCNN.

## Daftar File

| File | Tahap | Deskripsi |
|------|-------|-----------|
| `Data_Wrangling.ipynb` | Tahap 1 | Gathering (3 sumber), assessing, cleaning, preprocessing NLP, stratified split |
| `eda.ipynb` | Tahap 2 | EDA: menjawab 5 Business Questions dengan visualisasi dan uji statistik |
| `dashboard.py` | Tahap 3 | Dashboard Streamlit interaktif untuk visualisasi EDA |
| `ab_testing.ipynb` | Tahap 4 | A/B Testing threshold deployment model TextCNN |

## Urutan Pengerjaan
> Tahap 1 → Tahap 2 → Tahap 3 → Tahap 4 (Setiap tahap bergantung pada output tahap sebelumnya. Pastikan menjalankan sesuai urutan).

---

## Tahap 1 — Data_Wrangling.ipynb

**Input:** Dataset mentah dari 3 sumber (lihat `../dataset/raw/README.md`)

**Yang dilakukan:**
- Gathering dari GitHub Gist (yudiwbs), GitHub (bopbi), dan Kaggle (gevabriel)
- Assessing: cek missing values, duplikat, inkonsistensi format
- Cleaning & preprocessing NLP: lowercase, hapus karakter spesial, stopword removal, stemming (PySastrawi), filter bahasa via langdetect
- Label mapping ke binary: `1` (phishing) dan `0` (normal)
- Stratified split → train / val / test

**Output:** `dataset_phishing_sms_indo.csv` → simpan ke `../dataset/processed/`

**Cara menjalankan:**
1. Pastikan dataset raw sudah tersedia di `../dataset/raw/`
2. Buka di Google Colab atau Jupyter
3. Jalankan semua cell dari atas ke bawah
4. File output akan tersimpan otomatis

---

## Tahap 2 — eda.ipynb

**Input:** `dataset_phishing_sms_indo.csv` (output Tahap 1)

**Yang dilakukan (5 Business Questions):**

| BQ | Pertanyaan | Teknik |
|----|-----------|--------|
| BQ1 | Seberapa seimbang distribusi kelas? | Class distribution, imbalance ratio |
| BQ2 | Modus phishing apa yang paling dominan? | Analisis sub_kategori (tag-based) |
| BQ3 | Apakah URL & nomor panjang jadi indikator kuat phishing? | Korelasi Pearson fitur vs label |
| BQ4 | Kata & frasa apa yang paling sering muncul di phishing? | Word frequency, WordCloud, TF-IDF |
| BQ5 | Apakah panjang teks phishing berbeda signifikan? | Uji Mann-Whitney U, effect size |

**Output:** File gambar visualisasi (`.png`) untuk laporan dan dashboard

**Cara menjalankan:**
1. Pastikan `dataset_phishing_sms_indo.csv` sudah ada di direktori yang sama
2. Buka di Google Colab atau Jupyter
3. Jalankan semua cell dari atas ke bawah

---

## Tahap 3 — dashboard.py

**Input:** `dataset_phishing_sms_indo.csv` (output Tahap 1)

**Yang ditampilkan:**
- Overview & statistik deskriptif dataset
- Jawaban BQ1–BQ5 dalam bentuk visualisasi interaktif
- Filter dan navigasi antar section via sidebar

**Akses dashboard yang sudah di-deploy:**
https://phishing-detection-eda.streamlit.app/

**Cara menjalankan secara lokal:**
```bash
pip install streamlit pandas numpy matplotlib seaborn scikit-learn scipy wordcloud
streamlit run dashboard.py
```
Pastikan file `dataset_phishing_sms_indo.csv` berada di folder yang sama dengan `dashboard.py`.

---

## Tahap 4 — ab_testing.ipynb

**Input:**
- `smishing_model_best.keras` — model TextCNN terlatih (dari tim AI)
- `model_config.json` — konfigurasi fitur & kolom
- `dataset_test.csv` — hold-out test set (output Tahap 1)

**Yang dilakukan:**
- Threshold sweep (0.05–0.95) untuk menemukan threshold optimal
- Definisi Grup A (threshold default = 0.5) vs Grup B (threshold optimal)
- Uji statistik: McNemar Test, Z-Test proporsi, Cohen's h, Wilson CI
- Error analysis: pesan mana yang salah prediksi

**Hipotesis:**
- H₀: Tidak ada perbedaan performa signifikan antara threshold default dan optimal
- H₁: Threshold optimal menghasilkan performa yang secara statistik berbeda
- Alpha (α) = 0.05, metrik primer: FNR (False Negative Rate)

**Output:** `ab_testing_result.png`, `ab_error_analysis.csv`

**Cara menjalankan:**
1. Buka di Google Colab
2. Upload ketiga file input saat diminta
3. Jalankan semua cell dari atas ke bawah
