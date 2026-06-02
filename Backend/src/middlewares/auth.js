import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export default function protect(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Anda tidak memiliki akses. Silakan login terlebih dahulu.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key');

    // Attach decoded user info to request object
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuth(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key');
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email
      };
    }
    next();
  } catch (error) {
    // If token is invalid or expired, just proceed as anonymous
    next();
  }
}
