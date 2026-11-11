const { createClient } = require('redis');
require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 60;
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

let client = null;
let isConnected = false;
let lastError = null;

// Metrics for the PoC dashboard
const metrics = {
  hits: 0,
  misses: 0,
  writes: 0,
  invalidations: 0,
};

// In-memory cache fallback if Redis container is not running
const inMemoryCache = new Map();

async function initRedis() {
  if (!REDIS_ENABLED) {
    console.log('[Redis] Cache disabled via REDIS_ENABLED=false');
    return;
  }

  try {
    console.log(`[Redis] Connecting to Redis at ${REDIS_URL}...`);
    client = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            return 5000;
          }
          return Math.min(retries * 500, 3000);
        }
      }
    });

    client.on('error', (err) => {
      lastError = err.message;
      isConnected = false;
      // throttle noise
      if (!lastErrorLogged || Date.now() - lastErrorLogged > 10000) {
        console.warn('[Redis] Connection warning:', err.message);
        lastErrorLogged = Date.now();
      }
    });

    client.on('ready', () => {
      isConnected = true;
      lastError = null;
      console.log('[Redis] Connected successfully to Redis! ⚡');
    });

    client.on('end', () => {
      isConnected = false;
    });

    await client.connect();
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn('[Redis] Could not connect to Redis server directly:', err.message);
    console.warn('[Redis] Using in-memory cache until Redis is ready.');
  }
}

let lastErrorLogged = 0;

async function getCache(key) {
  if (isConnected && client) {
    try {
      const data = await client.get(key);
      if (data) {
        metrics.hits++;
        return { value: JSON.parse(data), source: 'redis' };
      }
      metrics.misses++;
      return null;
    } catch (err) {
      console.error('[Redis] Get error:', err.message);
    }
  }

  // Fallback to in-memory cache
  if (inMemoryCache.has(key)) {
    const item = inMemoryCache.get(key);
    if (Date.now() < item.expiresAt) {
      metrics.hits++;
      return { value: item.value, source: 'in_memory_cache' };
    }
    inMemoryCache.delete(key);
  }
  metrics.misses++;
  return null;
}

async function setCache(key, value, ttlSeconds = CACHE_TTL_SECONDS) {
  metrics.writes++;
  if (isConnected && client) {
    try {
      await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
      return true;
    } catch (err) {
      console.error('[Redis] Set error:', err.message);
    }
  }

  // Fallback to in-memory cache
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000
  });
  return true;
}

async function invalidatePattern(prefix) {
  metrics.invalidations++;
  if (isConnected && client) {
    try {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`[Redis] Invalidated ${keys.length} cached keys for prefix "${prefix}"`);
      }
    } catch (err) {
      console.error('[Redis] Invalidation error:', err.message);
    }
  }

  // Invalidate in-memory fallback
  for (const key of inMemoryCache.keys()) {
    if (key.startsWith(prefix)) {
      inMemoryCache.delete(key);
    }
  }
}

async function flushAll() {
  if (isConnected && client) {
    try {
      await client.flushAll();
      console.log('[Redis] Cache flushed completely');
    } catch (err) {
      console.error('[Redis] Flush error:', err.message);
    }
  }
  inMemoryCache.clear();
  return true;
}

async function getStatus() {
  let keyCount = 0;
  if (isConnected && client) {
    try {
      const keys = await client.keys('*');
      keyCount = keys.length;
    } catch (e) {
      keyCount = 0;
    }
  } else {
    keyCount = inMemoryCache.size;
  }

  return {
    connected: isConnected,
    url: REDIS_URL,
    keysCount: keyCount,
    lastError: lastError,
    mode: isConnected ? 'Redis Server (Live)' : 'Fallback In-Memory Cache',
    metrics
  };
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  invalidatePattern,
  flushAll,
  getStatus,
  CACHE_TTL_SECONDS
};
