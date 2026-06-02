
// Centralized Error Handling Middleware
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.url} - Status: ${statusCode}`);
  console.error(err.stack || err);

  // If it's a validation error (like from Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'fail',
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle generic JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      error: 'Token tidak valid. Silakan login kembali.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      error: 'Token kedaluwarsa. Silakan login kembali.'
    });
  }

  // Custom AppError
  if (err.isOperational) {
    return res.status(statusCode).json({
      status: statusCode >= 500 ? 'error' : 'fail',
      error: message,
      ...(err.details && { details: err.details })
    });
  }

  // Default Fallback for unhandled programming errors or server issues
  return res.status(500).json({
    status: 'error',
    error: 'Terjadi kesalahan internal pada server.'
  });
}
