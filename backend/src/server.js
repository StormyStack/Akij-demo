const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initOraclePool, getStatus: getDbStatus } = require('./config/db');
const { initRedis, getStatus: getRedisStatus } = require('./config/redis');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// System Health & Architecture Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = getDbStatus();
  const redisStatus = await getRedisStatus();

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
      }
    }
  });
});

// Mount Routes
app.use('/api/items', itemsRouter);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: '🚀 3-Tier Demo Application Backend API is running!',
    documentation: {
      health: 'GET /api/health',
      items: 'GET /api/items',
      createItem: 'POST /api/items',
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
