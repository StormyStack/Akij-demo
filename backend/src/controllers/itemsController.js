const { executeQuery, oracledb } = require('../config/db');
const { getCache, setCache, invalidatePattern, flushAll } = require('../config/redis');

// Normalizes row object keys from Oracle uppercase (ID, NAME, etc.) to lowercase
function normalizeItem(row) {
  if (!row) return null;
  return {
    id: row.ID !== undefined ? row.ID : row.id,
    name: row.NAME !== undefined ? row.NAME : row.name,
    sku: row.SKU !== undefined ? row.SKU : row.sku,
    category: row.CATEGORY !== undefined ? row.CATEGORY : row.category,
    price: row.PRICE !== undefined ? Number(row.PRICE) : Number(row.price),
    stock_quantity: row.STOCK_QUANTITY !== undefined ? Number(row.STOCK_QUANTITY) : Number(row.stock_quantity),
    description: row.DESCRIPTION !== undefined ? row.DESCRIPTION : row.description,
    status: row.STATUS !== undefined ? row.STATUS : row.status,
    created_at: row.CREATED_AT !== undefined ? row.CREATED_AT : row.created_at,
    updated_at: row.UPDATED_AT !== undefined ? row.UPDATED_AT : row.updated_at,
  };
}

// GET /api/items
async function getItems(req, res) {
  const startTime = Date.now();
  const { search = '', category = '', status = '' } = req.query;
  const cacheKey = `items:list:${search.trim().toLowerCase()}:${category.trim().toLowerCase()}:${status.trim().toLowerCase()}`;

  try {
    // 1. Check Redis Cache
    const cached = await getCache(cacheKey);
    if (cached) {
      const durationMs = Date.now() - startTime;
      return res.json({
        success: true,
        source: 'redis_cache',
        executionTimeMs: durationMs,
        count: cached.value.length,
        data: cached.value,
      });
    }

    // 2. Cache Miss -> Query Oracle DB
    let sql = 'SELECT * FROM items WHERE 1=1';
    const binds = {};

    if (search) {
      sql += ' AND (LOWER(name) LIKE :search OR LOWER(sku) LIKE :search OR LOWER(category) LIKE :search)';
      binds.search = `%${search.toLowerCase()}%`;
    }
    if (category) {
      sql += ' AND category = :category';
      binds.category = category;
    }
    if (status) {
      sql += ' AND status = :status';
      binds.status = status;
    }
    sql += ' ORDER BY id DESC';

    const result = await executeQuery(sql, binds);
    const items = (result.rows || []).map(normalizeItem);

    // 3. Cache the result in Redis for subsequent requests
    await setCache(cacheKey, items, 60);

    const durationMs = Date.now() - startTime;
    return res.json({
      success: true,
      source: result.source || 'oracle_database',
      executionTimeMs: durationMs,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve items',
      error: error.message,
    });
  }
}

// GET /api/items/:id
async function getItemById(req, res) {
  const startTime = Date.now();
  const { id } = req.params;
  const cacheKey = `items:item:${id}`;

  try {
    // Check Cache
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        source: 'redis_cache',
        executionTimeMs: Date.now() - startTime,
        data: cached.value,
      });
    }

    const sql = 'SELECT * FROM items WHERE id = :id';
    const result = await executeQuery(sql, { id: parseInt(id, 10) });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Item #${id} not found` });
    }

    const item = normalizeItem(result.rows[0]);
    await setCache(cacheKey, item, 60);

    return res.json({
      success: true,
      source: result.source || 'oracle_database',
      executionTimeMs: Date.now() - startTime,
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/items
async function createItem(req, res) {
  const { name, sku, category, price, stock_quantity = 0, description = '', status = 'ACTIVE' } = req.body;

  if (!name || !sku || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, sku, category, price are required',
    });
  }

  try {
    const sql = `
      INSERT INTO items (name, sku, category, price, stock_quantity, description, status)
      VALUES (:name, :sku, :category, :price, :stock_quantity, :description, :status)
      RETURNING id INTO :id
    `;
    const binds = {
      name,
      sku: sku.toUpperCase(),
      category,
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity, 10) || 0,
      description,
      status,
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
    };

    const result = await executeQuery(sql, binds);
    const createdId = result.outBinds && result.outBinds.id ? result.outBinds.id[0] : null;

    // Cache Invalidation
    await invalidatePattern('items:');

    return res.status(201).json({
      success: true,
      message: 'Item created successfully in Oracle DB',
      source: result.source || 'oracle_database',
      data: {
        id: createdId,
        name,
        sku: sku.toUpperCase(),
        category,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity, 10) || 0,
        description,
        status,
      },
    });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ success: false, message: 'Failed to create item', error: error.message });
  }
}

// PUT /api/items/:id
async function updateItem(req, res) {
  const { id } = req.params;
  const { name, category, price, stock_quantity, description, status } = req.body;

  try {
    const sql = `
      UPDATE items
      SET name = :name,
          category = :category,
          price = :price,
          stock_quantity = :stock_quantity,
          description = :description,
          status = :status
      WHERE id = :id
    `;
    const binds = {
      id: parseInt(id, 10),
      name,
      category,
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity, 10) || 0,
      description: description || '',
      status: status || 'ACTIVE',
    };

    const result = await executeQuery(sql, binds);

    // Cache Invalidation
    await invalidatePattern('items:');

    return res.json({
      success: true,
      message: `Item #${id} updated successfully`,
      rowsAffected: result.rowsAffected,
      source: result.source || 'oracle_database',
    });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ success: false, message: 'Failed to update item', error: error.message });
  }
}

// DELETE /api/items/:id
async function deleteItem(req, res) {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM items WHERE id = :id';
    const result = await executeQuery(sql, { id: parseInt(id, 10) });

    // Cache Invalidation
    await invalidatePattern('items:');

    return res.json({
      success: true,
      message: `Item #${id} deleted successfully`,
      rowsAffected: result.rowsAffected,
      source: result.source || 'oracle_database',
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete item', error: error.message });
  }
}

// POST /api/cache/flush
async function clearCache(req, res) {
  try {
    await flushAll();
    return res.json({
      success: true,
      message: 'Redis cache successfully flushed! Subsequent queries will hit Oracle DB directly.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  clearCache,
};
