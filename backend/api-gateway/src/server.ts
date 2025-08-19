import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

// Redis client for caching and rate limiting
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => logger.error('Redis Client Error', err));
redis.connect();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  next();
});

// JWT Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: { code: 'NO_TOKEN', message: 'Access token required' } 
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;

    // Check if token is blacklisted (for logout)
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_BLACKLISTED', message: 'Token has been revoked' }
      });
    }

    next();
  } catch (error) {
    logger.error('JWT verification failed', { error, token });
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid access token' }
    });
  }
};

// Service endpoints configuration
const services = {
  auth: {
    url: `http://localhost:${process.env.AUTH_SERVICE_PORT || 3001}`,
    prefix: '/api/auth',
  },
  user: {
    url: `http://localhost:${process.env.USER_SERVICE_PORT || 3002}`,
    prefix: '/api/users',
    requireAuth: true,
  },
  content: {
    url: `http://localhost:${process.env.CONTENT_SERVICE_PORT || 3003}`,
    prefix: '/api/content',
    requireAuth: true,
  },
  session: {
    url: `http://localhost:${process.env.SESSION_SERVICE_PORT || 3004}`,
    prefix: '/api/session',
    requireAuth: true,
  },
  tutor: {
    url: `http://localhost:${process.env.TUTOR_SERVICE_PORT || 3005}`,
    prefix: '/api/tutor',
    requireAuth: true,
  },
  scoring: {
    url: `http://localhost:${process.env.SCORING_WORKER_PORT || 3006}`,
    prefix: '/api/scoring',
    requireAuth: true,
  },
  srs: {
    url: `http://localhost:${process.env.SRS_SCHEDULER_PORT || 3007}`,
    prefix: '/api/srs',
    requireAuth: true,
  },
  analytics: {
    url: `http://localhost:${process.env.ANALYTICS_SERVICE_PORT || 3008}`,
    prefix: '/api/analytics',
    requireAuth: true,
  },
  notification: {
    url: `http://localhost:${process.env.NOTIFICATION_SERVICE_PORT || 3009}`,
    prefix: '/api/notifications',
    requireAuth: true,
  },
};

// Create proxy middlewares for each service
Object.entries(services).forEach(([serviceName, config]) => {
  const proxyMiddleware = createProxyMiddleware({
    target: config.url,
    changeOrigin: true,
    pathRewrite: {
      [`^${config.prefix}`]: '',
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}`, { error: err, url: req.url });
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: `${serviceName} service is temporarily unavailable`,
        },
      });
    },
    onProxyReq: (proxyReq, req: any) => {
      // Forward user info to services
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role || 'user');
      }
    },
  });

  // Apply authentication middleware if required
  if (config.requireAuth) {
    app.use(config.prefix, authenticateToken, proxyMiddleware);
  } else {
    app.use(config.prefix, proxyMiddleware);
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, string>,
  };

  // Check service health
  for (const [serviceName, config] of Object.entries(services)) {
    try {
      const response = await fetch(`${config.url}/health`, { 
        method: 'GET',
        timeout: 5000 
      });
      health.services[serviceName] = response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      health.services[serviceName] = 'unhealthy';
    }
  }

  res.json(health);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error', { error: err, url: req.url });
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await redis.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`API Gateway listening on port ${PORT}`);
});

export default app;