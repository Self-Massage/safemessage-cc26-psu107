import axios from 'axios';
import { z } from 'zod';
import prisma from '../lib/db.js';
import { AppError } from '../middlewares/errorHandler.js';

const predictSchema = z.object({
  message: z.string().min(1, 'Pesan tidak boleh kosong'),
});

export async function checkMessage(req, res, next) {
  try {
    // Support either "message" or "teks" in body
    const bodyText = req.body.message || req.body.teks;
    
    if (!bodyText || typeof bodyText !== 'string' || !bodyText.trim()) {
      throw new AppError('Pesan SMS tidak boleh kosong.', 400);
    }

    const messageText = bodyText.trim();

    // Call Hugging Face Space API
    const hfUrl = process.env.HF_API_URL || 'https://hafi1-smishing-detection-api.hf.space/api/v1/predictions';
    
    console.log(`[PROXY] Calling Hugging Face AI at: ${hfUrl}`);
    
    const hfResponse = await axios.post(hfUrl, {
      teks: messageText
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 seconds timeout
    });

    const raw = hfResponse.data;
    console.log('AI Model Raw Response:', raw);

    if (!raw || typeof raw !== 'object') {
      throw new AppError('Respon dari model AI tidak valid.', 502);
    }

    const isPhishing = raw.is_phishing ?? false;
    const confidence = raw.confidence ?? 0;
    const label = raw.label ?? (isPhishing ? 'PHISHING' : 'NORMAL');
    const normalScore = raw.normal_score ?? (isPhishing ? 0 : 100);
    const phishingScore = raw.phishing_score ?? (isPhishing ? 100 : 0);
    const rekomendasi = raw.rekomendasi ?? (isPhishing 
      ? 'Pesan ini terdeteksi sebagai PHISHING. Disarankan untuk tidak membalas, tidak mengklik tautan apa pun, dan segera menghapusnya.'
      : 'Pesan ini terdeteksi sebagai AMAN. Namun, harap selalu berhati-hati sebelum membagikan informasi sensitif.');

    const status = isPhishing ? 'phishing' : 'safe';
    const reason = rekomendasi;

    // Save history to database associated with logged in user (from req.user)
    const historyEntry = await prisma.history.create({
      data: {
        message: messageText,
        status,
        reason,
        confidence,
        rekomendasi,
        phishingScore,
        normalScore,
        label,
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        id: historyEntry.id,
        message: historyEntry.message,
        status: historyEntry.status,
        reason: historyEntry.reason,
        confidence: historyEntry.confidence,
        rekomendasi: historyEntry.rekomendasi,
        phishingScore: historyEntry.phishingScore,
        normalScore: historyEntry.normalScore,
        label: historyEntry.label,
        timestamp: historyEntry.timestamp,
        user: historyEntry.user
      }
    });

  } catch (error) {
    console.error('Prediction Proxy Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return next(new AppError('Koneksi ke AI server timeout. Silakan coba sesaat lagi.', 504));
    }
    
    if (error.response) {
      return next(new AppError(`AI Server Error (${error.response.status}): ${error.response.data?.error || 'Gagal menganalisis'}`, 502));
    }

    next(error);
  }
}
