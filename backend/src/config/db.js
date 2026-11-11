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
  { ID: 1, NAME: 'Apex Industrial Supplies Ltd', CODE: 'SUP-001', CONTACT_PERSON: 'Rafiqul Islam', EMAIL: 'rafiqul@apexindustrial.com', PHONE: '+880-1711-223344', CITY: 'Dhaka', PAYMENT_TERMS: 'Net 30', STATUS: 'ACTIVE' },
  { ID: 2, NAME: 'Pacific Global Tech Corp', CODE: 'SUP-002', CONTACT_PERSON: 'Tanvir Ahmed', EMAIL: 'tanvir@pacifictech.com', PHONE: '+880-1819-556677', CITY: 'Chittagong', PAYMENT_TERMS: 'Net 15', STATUS: 'ACTIVE' },
  { ID: 3, NAME: 'Bengal Packaging & Plastics', CODE: 'SUP-003', CONTACT_PERSON: 'Farhana Yasmin', EMAIL: 'farhana@bengalpack.com', PHONE: '+880-1912-334455', CITY: 'Gazipur', PAYMENT_TERMS: 'Net 45', STATUS: 'ACTIVE' },
];

let mockCustomers = [
  { ID: 1, NAME: 'Dhaka Logistics & Distribution', CUSTOMER_CODE: 'CUST-101', CONTACT_PERSON: 'Kamrul Hasan', EMAIL: 'kamrul@dhakalogistics.com', PHONE: '+880-1715-998877', CITY: 'Dhaka', CREDIT_LIMIT: 75000, STATUS: 'ACTIVE' },
  { ID: 2, NAME: 'Meghna Retail Corporation', CUSTOMER_CODE: 'CUST-102', CONTACT_PERSON: 'Shahidul Alam', EMAIL: 'shahidul@meghnaretail.com', PHONE: '+880-1611-443322', CITY: 'Narayanganj', CREDIT_LIMIT: 120000, STATUS: 'ACTIVE' },
  { ID: 3, NAME: 'Karnafuli Trading International', CUSTOMER_CODE: 'CUST-103', CONTACT_PERSON: 'Nasreen Sultana', EMAIL: 'nasreen@karnafulitrading.com', PHONE: '+880-1817-665544', CITY: 'Chittagong', CREDIT_LIMIT: 90000, STATUS: 'ACTIVE' },
];

let mockItems = [
  { ID: 1, NAME: 'Heavy Duty Industrial Motor 5HP', SKU: 'PRD-MTR-5HP', CATEGORY: 'Machinery', UNIT_OF_MEASURE: 'UNIT', COST_PRICE: 450.00, PRICE: 680.00, STOCK_QUANTITY: 24, REORDER_LEVEL: 8, SUPPLIER_ID: 1, DESCRIPTION: 'Three-phase 5HP AC induction motor', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 2, NAME: 'Corrugated Shipping Cartons (500 Pack)', SKU: 'PRD-BOX-500', CATEGORY: 'Packaging', UNIT_OF_MEASURE: 'BUNDLE', COST_PRICE: 120.00, PRICE: 185.00, STOCK_QUANTITY: 150, REORDER_LEVEL: 40, SUPPLIER_ID: 3, DESCRIPTION: 'Heavy duty 5-ply export quality packaging boxes', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 3, NAME: 'Enterprise Ethernet Switch 48-Port PoE', SKU: 'PRD-NET-SW48', CATEGORY: 'Electronics', UNIT_OF_MEASURE: 'UNIT', COST_PRICE: 820.00, PRICE: 1250.00, STOCK_QUANTITY: 12, REORDER_LEVEL: 5, SUPPLIER_ID: 2, DESCRIPTION: 'Managed Gigabit PoE+ switch with 4x 10G SFP+', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 4, NAME: 'Polypropylene Pellet Raw Resin (25kg)', SKU: 'PRD-RSN-PP25', CATEGORY: 'Raw Materials', UNIT_OF_MEASURE: 'BAG', COST_PRICE: 38.00, PRICE: 56.50, STOCK_QUANTITY: 4, REORDER_LEVEL: 25, SUPPLIER_ID: 3, DESCRIPTION: 'Virgin grade injection molding polypropylene resin', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 5, NAME: 'Precision Digital Caliper 150mm', SKU: 'PRD-TLS-CALP', CATEGORY: 'Tools', UNIT_OF_MEASURE: 'PCS', COST_PRICE: 28.00, PRICE: 48.00, STOCK_QUANTITY: 65, REORDER_LEVEL: 15, SUPPLIER_ID: 1, DESCRIPTION: 'Stainless steel IP54 electronic vernier caliper', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
  { ID: 6, NAME: 'Thermal Barcode Label Roll (1000 Labels)', SKU: 'PRD-LBL-1000', CATEGORY: 'Packaging', UNIT_OF_MEASURE: 'ROLL', COST_PRICE: 6.50, PRICE: 12.00, STOCK_QUANTITY: 3, REORDER_LEVEL: 20, SUPPLIER_ID: 3, DESCRIPTION: 'Direct thermal self-adhesive logistics labels', STATUS: 'ACTIVE', CREATED_AT: new Date(), UPDATED_AT: new Date() },
];

let mockOrders = [
  { ID: 1, ORDER_NUMBER: 'SO-2026-001', CUSTOMER_ID: 1, CUSTOMER_NAME: 'Dhaka Logistics & Distribution', ORDER_DATE: new Date(Date.now() - 5 * 86400000), DUE_DATE: new Date(Date.now() + 10 * 86400000), TOTAL_AMOUNT: 4260.00, STATUS: 'APPROVED', PAYMENT_STATUS: 'PAID', NOTES: 'Priority dispatch for warehouse expansion' },
  { ID: 2, ORDER_NUMBER: 'SO-2026-002', CUSTOMER_ID: 2, CUSTOMER_NAME: 'Meghna Retail Corporation', ORDER_DATE: new Date(Date.now() - 2 * 86400000), DUE_DATE: new Date(Date.now() + 7 * 86400000), TOTAL_AMOUNT: 7400.00, STATUS: 'PROCESSING', PAYMENT_STATUS: 'PARTIAL', NOTES: 'Partial payment received. Awaiting dispatch' },
  { ID: 3, ORDER_NUMBER: 'SO-2026-003', CUSTOMER_ID: 3, CUSTOMER_NAME: 'Karnafuli Trading International', ORDER_DATE: new Date(Date.now() - 1 * 86400000), DUE_DATE: new Date(Date.now() + 14 * 86400000), TOTAL_AMOUNT: 2500.00, STATUS: 'PENDING', PAYMENT_STATUS: 'UNPAID', NOTES: 'New purchase requisition submitted' },
  { ID: 4, ORDER_NUMBER: 'SO-2026-004', CUSTOMER_ID: 1, CUSTOMER_NAME: 'Dhaka Logistics & Distribution', ORDER_DATE: new Date(Date.now() - 12 * 86400000), DUE_DATE: new Date(Date.now() - 2 * 86400000), TOTAL_AMOUNT: 11250.00, STATUS: 'COMPLETED', PAYMENT_STATUS: 'PAID', NOTES: 'Fulfilled and signed on delivery' },
];

let mockNextItemId = 7;
let mockNextOrderId = 5;

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
