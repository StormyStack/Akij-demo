const oracledb = require('oracledb');
require('dotenv').config();

// Default oracledb settings
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const dbConfig = {
  user: process.env.ORACLE_USER || 'poc_user',
  password: process.env.ORACLE_PASSWORD || 'poc_password',
  connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/FREEPDB1',
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
};

let pool = null;
let isConnected = false;
let lastError = null;

// Initial sample mock data if Oracle container is still spinning up
let mockItems = [
  { ID: 1, NAME: 'Dell UltraSharp 27" 4K Monitor', SKU: 'MON-DEL-4K27', CATEGORY: 'Electronics', PRICE: 449.99, STOCK_QUANTITY: 28, DESCRIPTION: '4K UHD IPS display with USB-C Hub', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 2, NAME: 'Logitech MX Master 3S Wireless Mouse', SKU: 'ACC-LOG-MX3S', CATEGORY: 'Accessories', PRICE: 99.99, STOCK_QUANTITY: 65, DESCRIPTION: 'Quiet clicks with 8K DPI sensor', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 3, NAME: 'Keychron Q1 Pro Mechanical Keyboard', SKU: 'KEY-KCH-Q1P', CATEGORY: 'Peripherals', PRICE: 199.00, STOCK_QUANTITY: 18, DESCRIPTION: 'Custom wireless QMK/VIA gasket-mounted', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 4, NAME: 'Sony WH-1000XM5 Headphones', SKU: 'AUD-SNY-XM5', CATEGORY: 'Audio', PRICE: 398.00, STOCK_QUANTITY: 42, DESCRIPTION: 'Industry leading noise cancellation', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() }
];
let mockNextId = 5;

async function initOraclePool() {
  try {
    console.log(`[Oracle DB] Attempting connection to: ${dbConfig.connectString} as user: ${dbConfig.user}...`);
    pool = await oracledb.createPool(dbConfig);
    isConnected = true;
    lastError = null;
    console.log('[Oracle DB] Connected successfully to Oracle Database Pool! 🗄️');
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn('[Oracle DB] Database not ready yet or unreachable:', err.message);
    console.warn('[Oracle DB] Running with in-memory fallback until Oracle DB container finishes initialization.');
  }
}

// Background poller to auto-connect once Oracle container is healthy
setInterval(async () => {
  if (!isConnected) {
    try {
      pool = await oracledb.createPool(dbConfig);
      isConnected = true;
      lastError = null;
      console.log('[Oracle DB] Auto-connected to Oracle Database Pool! 🗄️');
    } catch (err) {
      lastError = err.message;
    }
  }
}, 10000);

async function executeQuery(sql, binds = [], options = {}) {
  if (isConnected && pool) {
    let connection;
    try {
      connection = await pool.getConnection();
      const result = await connection.execute(sql, binds, {
        autoCommit: true,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        ...options,
      });
      return {
        rows: result.rows || [],
        rowsAffected: result.rowsAffected || 0,
        outBinds: result.outBinds || null,
        source: 'oracle_database',
      };
    } catch (err) {
      console.error('[Oracle DB] Query Execution Error:', err);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error('[Oracle DB] Error closing connection:', closeErr);
        }
      }
    }
  }

  // In-memory fallback if Oracle DB is still initializing
  return handleMockQuery(sql, binds);
}

function handleMockQuery(sql, binds = []) {
  const normalizedSql = sql.trim().toUpperCase();

  if (normalizedSql.startsWith('SELECT * FROM ITEMS') || normalizedSql.includes('FROM ITEMS')) {
    let result = [...mockItems];
    if (binds && binds.search) {
      const q = binds.search.toLowerCase();
      result = result.filter(item => 
        item.NAME.toLowerCase().includes(q) || 
        item.CATEGORY.toLowerCase().includes(q) ||
        item.SKU.toLowerCase().includes(q)
      );
    }
    return { rows: result, source: 'in_memory_fallback (waiting for Oracle DB)' };
  }

  if (normalizedSql.startsWith('INSERT INTO ITEMS')) {
    const newItem = {
      ID: mockNextId++,
      NAME: binds.name,
      SKU: binds.sku,
      CATEGORY: binds.category,
      PRICE: parseFloat(binds.price),
      STOCK_QUANTITY: parseInt(binds.stock_quantity) || 0,
      DESCRIPTION: binds.description || '',
      STATUS: binds.status || 'ACTIVE',
      CREATED_AT: new Date(),
      UPDATED_AT: new Date()
    };
    mockItems.push(newItem);
    return { rowsAffected: 1, outBinds: { id: [newItem.ID] }, source: 'in_memory_fallback' };
  }

  if (normalizedSql.startsWith('UPDATE ITEMS')) {
    const id = binds.id;
    const index = mockItems.findIndex(i => i.ID === parseInt(id));
    if (index !== -1) {
      mockItems[index] = {
        ...mockItems[index],
        NAME: binds.name !== undefined ? binds.name : mockItems[index].NAME,
        CATEGORY: binds.category !== undefined ? binds.category : mockItems[index].CATEGORY,
        PRICE: binds.price !== undefined ? parseFloat(binds.price) : mockItems[index].PRICE,
        STOCK_QUANTITY: binds.stock_quantity !== undefined ? parseInt(binds.stock_quantity) : mockItems[index].STOCK_QUANTITY,
        DESCRIPTION: binds.description !== undefined ? binds.description : mockItems[index].DESCRIPTION,
        STATUS: binds.status !== undefined ? binds.status : mockItems[index].STATUS,
        UPDATED_AT: new Date()
      };
      return { rowsAffected: 1, source: 'in_memory_fallback' };
    }
    return { rowsAffected: 0, source: 'in_memory_fallback' };
  }

  if (normalizedSql.startsWith('DELETE FROM ITEMS')) {
    const id = binds.id;
    const prevLen = mockItems.length;
    mockItems = mockItems.filter(i => i.ID !== parseInt(id));
    return { rowsAffected: prevLen - mockItems.length, source: 'in_memory_fallback' };
  }

  return { rows: [], rowsAffected: 0, source: 'in_memory_fallback' };
}

function getStatus() {
  return {
    connected: isConnected,
    connectString: dbConfig.connectString,
    user: dbConfig.user,
    lastError: lastError,
    mode: isConnected ? 'Oracle Database (Live)' : 'Fallback Mock (Oracle starting / unavailable)'
  };
}

module.exports = {
  initOraclePool,
  executeQuery,
  getStatus,
  oracledb
};
