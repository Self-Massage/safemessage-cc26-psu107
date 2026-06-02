import prisma from '../lib/db.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function getHistory(req, res, next) {
  try {
    const histories = await prisma.history.findMany({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        histories
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function clearHistory(req, res, next) {
  try {
    await prisma.history.deleteMany({
      where: { userId: req.user.id }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Seluruh riwayat berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
}

export async function getStats(req, res, next) {
  try {
    const counts = await prisma.history.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: true
    });

    let safeCount = 0;
    let phishingCount = 0;

    counts.forEach(c => {
      if (c.status === 'safe') safeCount = c._count;
      if (c.status === 'phishing') phishingCount = c._count;
    });

    const totalCount = safeCount + phishingCount;

    return res.status(200).json({
      status: 'success',
      data: {
        totalCount,
        safeCount,
        phishingCount
      }
    });
  } catch (error) {
    next(error);
  }
}
