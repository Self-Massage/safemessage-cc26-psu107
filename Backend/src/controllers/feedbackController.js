import { z } from 'zod';
import prisma from '../lib/db.js';
import { AppError } from '../middlewares/errorHandler.js';

const feedbackSchema = z.object({
  category: z.string().min(1, 'Pilih kategori masukan'),
  message: z.string().min(10, 'Detail masukan minimal 10 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
});

export async function submitFeedback(req, res, next) {
  try {
    const validatedData = feedbackSchema.parse(req.body);

    const userId = req.user ? req.user.id : null;

    const feedback = await prisma.feedback.create({
      data: {
        category: validatedData.category,
        message: validatedData.message,
        email: validatedData.email || null,
        userId: userId
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Terima kasih atas masukan Anda!',
      data: {
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
}
