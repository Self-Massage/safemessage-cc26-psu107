import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/db.js';
import { AppError } from '../middlewares/errorHandler.js';

// Schemas for request validation
const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'super-secret-key',
    { expiresIn: '7d' }
  );
};

export async function register(req, res, next) {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError('Email sudah terdaftar. Silakan gunakan email lain.', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);

    return res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil!',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new AppError('Email atau password salah.', 401);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(validatedData.password, user.password);
    if (!isMatch) {
      throw new AppError('Email atau password salah.', 401);
    }

    const token = generateToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    // req.user has been attached by the protect middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan.', 404);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('Token Google tidak disertakan.', 400);
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new AppError('Google Client ID belum dikonfigurasi di server.', 500);
    }

    const client = new OAuth2Client(googleClientId);

    // Verify token with Google
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      throw new AppError('Token Google tidak valid atau telah kedaluwarsa.', 401);
    }

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      throw new AppError('Gagal mendapatkan email dari akun Google Anda.', 400);
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // If user does not exist, register them automatically
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-10) + Date.now().toString(), 10);
      user = await prisma.user.create({
        data: {
          name: name || email.split('@')[0],
          email,
          password: randomPassword,
        },
      });
    }

    // Generate our JWT token for this user
    const appToken = generateToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Login dengan Google berhasil!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: appToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

