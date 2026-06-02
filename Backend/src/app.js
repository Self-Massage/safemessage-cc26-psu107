import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Middlewares
import protect, { optionalAuth } from './middlewares/auth.js';
import errorHandler from './middlewares/errorHandler.js';

// Controllers
import { register, login, me, googleLogin } from './controllers/authController.js';
import { checkMessage } from './controllers/predictionController.js';
import { getHistory, clearHistory, getStats } from './controllers/historyController.js';
import { submitFeedback } from './controllers/feedbackController.js';

// Swagger Documentation
import { swaggerUi, swaggerSpec } from './lib/swagger.js';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP so Swagger UI assets load without blockages
}));
app.use(cors({
  origin: '*', // Customize this in production to match your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// ── SWAGGER API DOCUMENTATION ──
const swaggerOptions = {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
  ]
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// ── HEALTH CHECK ──
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── AUTHENTICATION ROUTES ──
app.post('/api/v1/auth/register', register);
app.post('/api/v1/auth/login', login);
app.post('/api/v1/auth/google', googleLogin);
app.get('/api/v1/auth/me', protect, me);

// ── PREDICTION / DETECTION GATEWAY ROUTES ──
app.post('/api/v1/predictions/check', protect, checkMessage);

// ── HISTORY ROUTES ──
app.get('/api/v1/history', protect, getHistory);
app.delete('/api/v1/history', protect, clearHistory);
app.get('/api/v1/history/stats', protect, getStats);

// ── FEEDBACK ROUTES ──
app.post('/api/v1/feedbacks', optionalAuth, submitFeedback);

// ── ROOT REDIRECT TO SWAGGER ──
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// ── 404 FALLBACK ROUTE ──
app.use('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    error: `Endpoint ${req.originalUrl} tidak ditemukan.`
  });
});

// ── CENTRALIZED ERROR HANDLER ──
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📂 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

export default app;
