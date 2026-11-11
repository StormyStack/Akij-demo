const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initOraclePool, getStatus: getDbStatus } = require('./config/db');
const { initRedis, getStatus: getRedisStatus } = require('./config/redis');
const logger = require('./config/logger');
const itemsRouter = require('./routes/items');
const backupRouter = require('./routes/backup');
const erpRouter = require('./routes/erp');
const docsRouter = require('./routes/docs');
const { getBackupHistory } = require('./services/backupService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Seq Structured Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`HTTP {Method} {Url} returned {StatusCode} in {DurationMs}ms`, {
      Method: req.method,
      Url: req.originalUrl || req.url,
      StatusCode: res.statusCode,
      DurationMs: duration,
      ClientIp: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
  });
  next();
});

// System Health & Architecture Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = getDbStatus();
  const redisStatus = await getRedisStatus();
  const seqStatus = logger.getStatus();
  const backupStatus = getBackupHistory();

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    tiers: {
      presentation: {
        name: 'React 18 + Vite Frontend',
        status: 'UP'
      },
      application: {
        name: 'Node.js Express REST API',
        port: PORT,
        uptimeSeconds: Math.floor(process.uptime()),
        status: 'UP'
      },
      data: {
        oracleDb: {
          name: 'Oracle Database 23ai Free',
          ...dbStatus
        },
        redis: {
          name: 'Redis Cache 7.x',
          ...redisStatus
        }
      },
      observability: {
        seq: {
          name: 'Seq Centralized Logging',
          url: seqStatus.seqUrl,
          connected: seqStatus.seqReachable,
          mode: 'Structured CLEF Ingestion'
        },
        backup: {
          name: 'Azure Blob Storage Backup Cron',
          interval: 'Every 1 Hour (0 * * * *)',
          container: backupStatus.container,
          configured: backupStatus.configured,
          totalBackups: backupStatus.totalBackups
        }
      }
    }
  });
});

// Mount Routes
app.use('/api/items', itemsRouter);
app.use('/api/erp', erpRouter);
app.use('/api/backup', backupRouter);
app.use('/docs', docsRouter);
app.use('/api/docs', docsRouter);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Akij ERP Cloud & 3-Tier Enterprise Backend API is running!',
    documentation: {
      swaggerUi: 'GET /docs or /api/docs',
      openApiJson: 'GET /docs/swagger.json',
      health: 'GET /api/health',
      erpDashboard: 'GET /api/erp/dashboard',
      orders: 'GET /api/erp/orders',
      customers: 'GET /api/erp/customers',
      suppliers: 'GET /api/erp/suppliers',
      items: 'GET /api/items',
      flushCache: 'POST /api/items/cache/flush'
    }
  });
});

// Start Server
async function startServer() {
  console.log('========================================================');
  console.log('  🚀 Starting 3-Tier Demo Application Backend Server');
  console.log('========================================================');

  // Initialize DB and Cache connections concurrently
  await Promise.allSettled([
    initOraclePool(),
    initRedis()
  ]);

  app.listen(PORT, () => {
    console.log(`[Backend API] Server listening on http://localhost:${PORT}`);
    console.log(`[Backend API] Healthcheck available at http://localhost:${PORT}/api/health`);
    console.log('========================================================');
  });
}

startServer();
