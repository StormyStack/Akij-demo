const express = require('express');
const router = express.Router();
const { executeQuery, oracledb } = require('../config/db');
const { getCache, setCache, invalidatePattern } = require('../config/redis');

// Normalizers
const norm = (row) => {
  const res = {};
  for (const k of Object.keys(row)) {
    res[k.toLowerCase()] = row[k];
  }
  return res;
};

// 1. ERP Executive Dashboard Overview
router.get('/dashboard', async (req, res) => {
  try {
    const [itemsRes, ordersRes, custRes, suppRes] = await Promise.all([
      executeQuery('SELECT * FROM items'),
      executeQuery('SELECT * FROM sales_orders'),
      executeQuery('SELECT * FROM customers'),
      executeQuery('SELECT * FROM suppliers')
    ]);

    const items = (itemsRes.rows || []).map(norm);
    const orders = (ordersRes.rows || []).map(norm);
    const customers = (custRes.rows || []).map(norm);
    const suppliers = (suppRes.rows || []).map(norm);

    // Calculate metrics
    const totalInventoryValuation = items.reduce((acc, i) => acc + (Number(i.price || 0) * Number(i.stock_quantity || 0)), 0);
    const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
    const lowStockItems = items.filter(i => Number(i.stock_quantity || 0) <= Number(i.reorder_level || 10));

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders: orders.length,
          pendingOrders: pendingOrdersCount,
          totalInventoryValuation,
          totalProducts: items.length,
          lowStockCount: lowStockItems.length,
          totalCustomers: customers.length,
          totalSuppliers: suppliers.length,
        },
        recentOrders: orders.slice(0, 5),
        lowStockAlerts: lowStockItems,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Sales Orders
router.get('/orders', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM sales_orders ORDER BY id DESC');
    res.json({ success: true, data: (result.rows || []).map(norm) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/orders', async (req, res) => {
  const { customer_id, total_amount, notes = '' } = req.body;
  const orderNumber = `SO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    const sql = `
      INSERT INTO sales_orders (order_number, customer_id, total_amount, status, payment_status, notes)
      VALUES (:order_number, :customer_id, :total_amount, 'PENDING', 'UNPAID', :notes)
    `;
    const binds = {
      order_number: orderNumber,
      customer_id: parseInt(customer_id, 10),
      total_amount: parseFloat(total_amount),
      notes,
    };
    await executeQuery(sql, binds);
    res.status(201).json({ success: true, message: 'Sales order created', orderNumber });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await executeQuery(
      'UPDATE sales_orders SET status = :status WHERE id = :id',
      { id: parseInt(id, 10), status }
    );
    res.json({ success: true, message: `Order #${id} status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Customers
router.get('/customers', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM customers ORDER BY name ASC');
    res.json({ success: true, data: (result.rows || []).map(norm) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/customers', async (req, res) => {
  const { name, contact_person, email, phone, city, credit_limit = 50000 } = req.body;
  const code = `CUST-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const sql = `
      INSERT INTO customers (name, customer_code, contact_person, email, phone, city, credit_limit, status)
      VALUES (:name, :code, :contact_person, :email, :phone, :city, :credit_limit, 'ACTIVE')
    `;
    await executeQuery(sql, {
      name, code, contact_person, email, phone, city, credit_limit: parseFloat(credit_limit)
    });
    res.status(201).json({ success: true, message: 'Customer registered' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const result = await executeQuery('SELECT * FROM suppliers ORDER BY name ASC');
    res.json({ success: true, data: (result.rows || []).map(norm) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/suppliers', async (req, res) => {
  const { name, contact_person, email, phone, city, payment_terms = 'Net 30' } = req.body;
  const code = `SUP-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const sql = `
      INSERT INTO suppliers (name, code, contact_person, email, phone, city, payment_terms, status)
      VALUES (:name, :code, :contact_person, :email, :phone, :city, :payment_terms, 'ACTIVE')
    `;
    await executeQuery(sql, {
      name, code, contact_person, email, phone, city, payment_terms
    });
    res.status(201).json({ success: true, message: 'Supplier registered' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
