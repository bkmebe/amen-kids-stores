import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import productsRoutes from './modules/products/products.routes';
import salesRoutes from './modules/sales/sales.routes';
import expensesRoutes from './modules/expenses/expenses.routes';
import reportsRoutes from './modules/reports/reports.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { reportsController } from './modules/reports/reports.controller';
import { authenticate } from './middleware/auth.middleware';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow localhost in development
    if (origin.includes('localhost')) return callback(null, true);
    // Allow all Vercel deployments
    if (origin.includes('vercel.app')) return callback(null, true);
    // Allow custom domains
    callback(null, true);
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 5, message: 'Too many login attempts' });

app.use('/api/auth/login', loginLimiter);
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Analytics routes (flat on /api/analytics)
app.get('/api/analytics/sales', authenticate, reportsController.salesAnalytics);
app.get('/api/analytics/expenses', authenticate, reportsController.expenseAnalytics);

// Settings language (flat on /api/settings)
// Already handled via /api/auth/settings/language in auth.routes

// Error handling
app.use(errorMiddleware);

export default app;
