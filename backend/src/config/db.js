const oracledb = require('oracledb');
require('dotenv').config();

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

// Mock ERP Data for in-memory fallback
let mockSuppliers = [
  { ID: 1, NAME: 'Fonterra Dairy & Butter Imports Ltd', CODE: 'SUP-BTR-01', CONTACT_PERSON: 'Rafiqul Islam', EMAIL: 'dairy@fonterra-imports.com', PHONE: '+880-1711-223344', CITY: 'Dhaka', PAYMENT_TERMS: 'Net 30', STATUS: 'ACTIVE' },
  { ID: 2, NAME: 'Puratos Gourmet Bakery Ingredients', CODE: 'SUP-ING-02', CONTACT_PERSON: 'Tanvir Ahmed', EMAIL: 'orders@puratos-bd.com', PHONE: '+880-1819-556677', CITY: 'Chittagong', PAYMENT_TERMS: 'Net 15', STATUS: 'ACTIVE' },
  { ID: 3, NAME: 'City Flour Mills & Grains Group', CODE: 'SUP-FLR-03', CONTACT_PERSON: 'Farhana Yasmin', EMAIL: 'supply@cityflour.com', PHONE: '+880-1912-334455', CITY: 'Narayanganj', PAYMENT_TERMS: 'Net 45', STATUS: 'ACTIVE' },
];

let mockCustomers = [
  { ID: 1, NAME: 'Artisan Cafe & Roastery (Banani)', CUSTOMER_CODE: 'CUST-BAKE-01', CONTACT_PERSON: 'Kamrul Hasan', EMAIL: 'orders@artisancafe.com', PHONE: '+880-1715-998877', CITY: 'Dhaka', CREDIT_LIMIT: 75000, STATUS: 'ACTIVE' },
  { ID: 2, NAME: 'The Westin Hotel & Bakery Lounge', CUSTOMER_CODE: 'CUST-BAKE-02', CONTACT_PERSON: 'Shahidul Alam', EMAIL: 'pastry@westindhaka.com', PHONE: '+880-1611-443322', CITY: 'Dhaka', CREDIT_LIMIT: 150000, STATUS: 'ACTIVE' },
  { ID: 3, NAME: 'North End Coffee & Bakery Outlets', CUSTOMER_CODE: 'CUST-BAKE-03', CONTACT_PERSON: 'Nasreen Sultana', EMAIL: 'procure@northendcoffee.com', PHONE: '+880-1817-665544', CITY: 'Chittagong', CREDIT_LIMIT: 95000, STATUS: 'ACTIVE' },
];

let mockItems = [
  { 
    ID: 1, 
    NAME: 'Artisan French Butter Croissant', 
    SKU: 'BAKE-CRS-001', 
    CATEGORY: 'Pastries & Viennoiserie', 
    UNIT_OF_MEASURE: 'PCS', 
    COST_PRICE: 1.20, 
    PRICE: 3.50, 
    STOCK_QUANTITY: 85, 
    REORDER_LEVEL: 20, 
    SUPPLIER_ID: 1, 
    IMAGE_URL: 'https://db2backup1.blob.core.windows.net/assets/Homemade-Croissants-1.jpg',
    DESCRIPTION: 'Freshly baked flaky artisan butter croissants with honeycomb interior', 
    STATUS: 'ACTIVE', 
    CREATED_AT: new Date(), 
    UPDATED_AT: new Date() 
  },
  { 
    ID: 2, 
    NAME: 'Spanish Basque Burnt Cheesecake', 
    SKU: 'BAKE-CHK-002', 
    CATEGORY: 'Cakes & Cheesecakes', 
    UNIT_OF_MEASURE: 'SLICE', 
    COST_PRICE: 4.50, 
    PRICE: 8.50, 
    STOCK_QUANTITY: 34, 
    REORDER_LEVEL: 10, 
    SUPPLIER_ID: 2, 
    IMAGE_URL: 'https://db2backup1.blob.core.windows.net/assets/brunt-cheesecake.jpg',
    DESCRIPTION: 'Caramelized top Basque style creamy burnt cheesecake with rich custard core', 
    STATUS: 'ACTIVE', 
    CREATED_AT: new Date(), 
    UPDATED_AT: new Date() 
  },
  { 
    ID: 3, 
    NAME: 'Sourdough Country Boule (800g)', 
    SKU: 'BAKE-BRD-003', 
    CATEGORY: 'Artisan Breads', 
    UNIT_OF_MEASURE: 'LOAF', 
    COST_PRICE: 1.80, 
    PRICE: 4.50, 
    STOCK_QUANTITY: 28, 
    REORDER_LEVEL: 8, 
    SUPPLIER_ID: 3, 
    IMAGE_URL: null,
    DESCRIPTION: 'Slow-fermented wild yeast rustic sourdough loaf with blistered crispy crust', 
    STATUS: 'ACTIVE', 
    CREATED_AT: new Date(), 
    UPDATED_AT: new Date() 
  },
  { 
    ID: 4, 
    NAME: 'Imported Unsalted Butter (25kg)', 
    SKU: 'RAW-BTR-25KG', 
    CATEGORY: 'Bakery Ingredients', 
    UNIT_OF_MEASURE: 'BLOCK', 
    COST_PRICE: 180.00, 
    PRICE: 240.00, 
    STOCK_QUANTITY: 5, 
    REORDER_LEVEL: 15, 
    SUPPLIER_ID: 1, 
    IMAGE_URL: null,
    DESCRIPTION: '82% butterfat European grade unsalted butter for pastry lamination', 
    STATUS: 'ACTIVE', 
    CREATED_AT: new Date(), 
    UPDATED_AT: new Date() 
  },
  { 
    ID: 5, 
    NAME: 'High-Protein Bread Flour (50kg)', 
    SKU: 'RAW-FLR-50KG', 
    CATEGORY: 'Bakery Ingredients', 
    UNIT_OF_MEASURE: 'BAG', 
    COST_PRICE: 28.00, 
    PRICE: 42.00, 
    STOCK_QUANTITY: 45, 
    REORDER_LEVEL: 20, 
    SUPPLIER_ID: 3, 
    IMAGE_URL: null,
    DESCRIPTION: '13.5% protein unbleached wheat flour for sourdough and croissants', 
    STATUS: 'ACTIVE', 
    CREATED_AT: new Date(), 
    UPDATED_AT: new Date() 
  },
  { 
    ID: 6, 
    NAME: 'Kraft Windowed Pastry Box (100 Pcs)', 
    SKU: 'PKG-BOX-100', 
    CATEGORY: 'Packaging', 
    UNIT_OF_MEASURE: 'PACK', 
    COST_PRICE: 12.00, 
    PRICE: 22.00, 
    STOCK_QUANTITY: 4, 
    REORDER_LEVEL: 15, 
    SUPPLIER_ID: 2, 
    IMAGE_URL: null,
    DESCRIPTION: 'Eco-friendly biodegradable bakery packaging with transparent PLA window', 
    STATUS: 'ACTIVE', 
    CREATED_AT: new Date(), 
    UPDATED_AT: new Date() 
  },
];

let mockOrders = [
  { ID: 1, ORDER_NUMBER: 'SO-2026-001', CUSTOMER_ID: 1, CUSTOMER_NAME: 'Artisan Cafe & Roastery', ORDER_DATE: new Date(Date.now() - 5 * 86400000), DUE_DATE: new Date(Date.now() + 10 * 86400000), TOTAL_AMOUNT: 350.00, STATUS: 'APPROVED', PAYMENT_STATUS: 'PAID', NOTES: 'Morning daily delivery batch (60 croissants + 10 cheesecakes)' },
  { ID: 2, ORDER_NUMBER: 'SO-2026-002', CUSTOMER_ID: 2, CUSTOMER_NAME: 'The Westin Hotel & Bakery Lounge', ORDER_DATE: new Date(Date.now() - 2 * 86400000), DUE_DATE: new Date(Date.now() + 7 * 86400000), TOTAL_AMOUNT: 680.00, STATUS: 'PROCESSING', PAYMENT_STATUS: 'PARTIAL', NOTES: 'Banquet dessert catering order' },
  { ID: 3, ORDER_NUMBER: 'SO-2026-003', CUSTOMER_ID: 3, CUSTOMER_NAME: 'North End Coffee & Bakery Outlets', ORDER_DATE: new Date(Date.now() - 1 * 86400000), DUE_DATE: new Date(Date.now() + 14 * 86400000), TOTAL_AMOUNT: 450.00, STATUS: 'PENDING', PAYMENT_STATUS: 'UNPAID', NOTES: 'Weekly stock replenishment' },
];

let mockNextItemId = 7;
let mockNextOrderId = 4;

const { runInitScripts } = require('../scripts/initDb');

async function initOraclePool() {
  try {
    console.log(`[Oracle DB] Attempting connection to: ${dbConfig.connectString} as user: ${dbConfig.user}...`);
    pool = await oracledb.createPool(dbConfig);
    isConnected = true;
    lastError = null;
    console.log('[Oracle DB] Connected successfully to Oracle Database Pool! 🗄️');
    runInitScripts().catch(e => console.warn('[Oracle DB] Schema auto-init notice:', e.message));
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn('[Oracle DB] Database not ready yet or unreachable:', err.message);
    console.warn('[Oracle DB] Running with in-memory ERP fallback.');
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
      runInitScripts().catch(e => console.warn('[Oracle DB] Schema auto-init notice:', e.message));
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
      console.error('[Oracle DB] Query Execution Error:', err.message);
      // Fallback gracefully on schema errors
      return handleMockQuery(sql, binds);
    } finally {
      if (connection) {
        try { await connection.close(); } catch (e) { /* ignore */ }
      }
    }
  }

  // Fallback to in-memory store
  return handleMockQuery(sql, binds);
}

function handleMockQuery(sql, binds = []) {
  const norm = sql.trim().toUpperCase();

  // Suppliers
  if (norm.includes('FROM SUPPLIERS')) {
    return { rows: mockSuppliers, source: 'in_memory_fallback' };
  }

  // Customers
  if (norm.includes('FROM CUSTOMERS')) {
    return { rows: mockCustomers, source: 'in_memory_fallback' };
  }

  // Sales Orders
  if (norm.includes('FROM SALES_ORDERS')) {
    let orders = [...mockOrders];
    if (binds && binds.status) {
      orders = orders.filter(o => o.STATUS === binds.status);
    }
    return { rows: orders, source: 'in_memory_fallback' };
  }

  // Items / Products
  if (norm.startsWith('SELECT') && norm.includes('ITEMS')) {
    let result = [...mockItems];
    if (binds && binds.search) {
      const q = binds.search.toLowerCase();
      result = result.filter(item => 
        item.NAME.toLowerCase().includes(q) || 
        item.CATEGORY.toLowerCase().includes(q) ||
        item.SKU.toLowerCase().includes(q)
      );
    }
    if (binds && binds.category) {
      result = result.filter(i => i.CATEGORY.toLowerCase() === binds.category.toLowerCase());
    }
    return { rows: result, source: 'in_memory_fallback' };
  }

  if (norm.startsWith('INSERT INTO ITEMS')) {
    const newItem = {
      ID: mockNextItemId++,
      NAME: binds.name,
      SKU: binds.sku,
      CATEGORY: binds.category,
      UNIT_OF_MEASURE: binds.unit_of_measure || 'PCS',
      COST_PRICE: parseFloat(binds.cost_price || 0),
      PRICE: parseFloat(binds.price),
      STOCK_QUANTITY: parseInt(binds.stock_quantity) || 0,
      REORDER_LEVEL: parseInt(binds.reorder_level) || 10,
      SUPPLIER_ID: binds.supplier_id || null,
      DESCRIPTION: binds.description || '',
      STATUS: binds.status || 'ACTIVE',
      CREATED_AT: new Date(),
      UPDATED_AT: new Date()
    };
    mockItems.unshift(newItem);
    return { rowsAffected: 1, outBinds: { id: [newItem.ID] }, source: 'in_memory_fallback' };
  }

  if (norm.startsWith('UPDATE ITEMS')) {
    const id = parseInt(binds.id);
    const idx = mockItems.findIndex(i => i.ID === id);
    if (idx !== -1) {
      mockItems[idx] = { ...mockItems[idx], ...binds, UPDATED_AT: new Date() };
      return { rowsAffected: 1, source: 'in_memory_fallback' };
    }
    return { rowsAffected: 0, source: 'in_memory_fallback' };
  }

  if (norm.startsWith('DELETE FROM ITEMS')) {
    const id = parseInt(binds.id);
    mockItems = mockItems.filter(i => i.ID !== id);
    return { rowsAffected: 1, source: 'in_memory_fallback' };
  }

  if (norm.startsWith('INSERT INTO SALES_ORDERS')) {
    const cust = mockCustomers.find(c => c.ID === parseInt(binds.customer_id));
    const newOrder = {
      ID: mockNextOrderId++,
      ORDER_NUMBER: binds.order_number,
      CUSTOMER_ID: parseInt(binds.customer_id),
      CUSTOMER_NAME: cust ? cust.NAME : 'Unknown Customer',
      ORDER_DATE: new Date(),
      DUE_DATE: new Date(Date.now() + 7 * 86400000),
      TOTAL_AMOUNT: parseFloat(binds.total_amount || 0),
      STATUS: binds.status || 'PENDING',
      PAYMENT_STATUS: binds.payment_status || 'UNPAID',
      NOTES: binds.notes || ''
    };
    mockOrders.unshift(newOrder);
    return { rowsAffected: 1, outBinds: { id: [newOrder.ID] }, source: 'in_memory_fallback' };
  }

  if (norm.startsWith('UPDATE SALES_ORDERS')) {
    const id = parseInt(binds.id);
    const idx = mockOrders.findIndex(o => o.ID === id);
    if (idx !== -1) {
      mockOrders[idx].STATUS = binds.status || mockOrders[idx].STATUS;
      return { rowsAffected: 1, source: 'in_memory_fallback' };
    }
    return { rowsAffected: 0, source: 'in_memory_fallback' };
  }

  return { rows: [], rowsAffected: 0, source: 'in_memory_fallback' };
}

function getStatus() {
  return {
    connected: isConnected,
    connectString: dbConfig.connectString,
    user: dbConfig.user,
    lastError: lastError,
    mode: isConnected ? 'Oracle Database (Live)' : 'Fallback In-Memory ERP Store'
  };
}

module.exports = {
  initOraclePool,
  executeQuery,
  getStatus,
  oracledb
};
