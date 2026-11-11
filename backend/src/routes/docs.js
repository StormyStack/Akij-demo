const express = require('express');
const router = express.Router();

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Akij ERP Cloud & 3-Tier Enterprise API',
    version: '1.0.0',
    description: 'Enterprise REST APIs connecting Azure Static Web Apps, Node.js Application Layer, Oracle Database 23ai Free, Redis 7 In-Memory Cache, and Azure Blob Storage Automated Backups.',
    contact: {
      name: 'Cloud Architecture Team',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Ingress / Origin Gateway',
    },
    {
      url: 'http://localhost:5000',
      description: 'Direct Backend Container (Port 5000)',
    },
    {
      url: 'http://localhost:80',
      description: 'Nginx Ingress Proxy (Port 80)',
    },
  ],
  tags: [
    { name: 'Architecture & Health', description: '3-Tier System status, connectivity, and telemetry' },
    { name: 'ERP Dashboard', description: 'Executive KPIs, order metrics, valuation, alerts' },
    { name: 'Sales Orders', description: 'Order lifecycle, status changes, and billing' },
    { name: 'Customers (CRM)', description: 'Customer master and credit management' },
    { name: 'Suppliers (Procurement)', description: 'Vendor master, terms, and contacts' },
    { name: 'Inventory & Cache', description: 'Item master with Redis Cache-Aside & Oracle DB' },
    { name: 'Disaster Recovery & Backup', description: 'Automated 12-hour snapshots to Azure Blob Storage' },
  ],
  paths: {
    '/api/health': {
      get: {
        tags: ['Architecture & Health'],
        summary: 'System Health & Tier Status',
        description: 'Checks connectivity across Presentation (SWA), Application (Express), Data (Oracle & Redis), Observability (Seq), and Backup (Azure Blob).',
        responses: {
          200: {
            description: 'System is healthy',
          },
        },
      },
    },
    '/api/erp/dashboard': {
      get: {
        tags: ['ERP Dashboard'],
        summary: 'Get Executive ERP KPI Metrics',
        description: 'Returns real-time revenue, order counts, pending orders, inventory valuation, and stock alerts.',
        responses: {
          200: {
            description: 'Dashboard metrics',
          },
        },
      },
    },
    '/api/erp/orders': {
      get: {
        tags: ['Sales Orders'],
        summary: 'List All Sales Orders',
        responses: {
          200: {
            description: 'Array of sales orders',
          },
        },
      },
      post: {
        tags: ['Sales Orders'],
        summary: 'Create New Sales Order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customer_id', 'total_amount'],
                properties: {
                  customer_id: { type: 'integer', example: 1 },
                  total_amount: { type: 'number', example: 4500.50 },
                  notes: { type: 'string', example: 'Urgent shipment via Chittagong depot' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Sales order created' },
        },
      },
    },
    '/api/erp/orders/{id}/status': {
      put: {
        tags: ['Sales Orders'],
        summary: 'Update Order Status',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], example: 'PROCESSING' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status updated' },
        },
      },
    },
    '/api/erp/customers': {
      get: {
        tags: ['Customers (CRM)'],
        summary: 'List All Customers',
        responses: {
          200: { description: 'Customer list' },
        },
      },
      post: {
        tags: ['Customers (CRM)'],
        summary: 'Register New Customer',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'city'],
                properties: {
                  name: { type: 'string', example: 'Apex Logistics Ltd' },
                  contact_person: { type: 'string', example: 'Kamal Hossain' },
                  email: { type: 'string', example: 'kamal@apex.com' },
                  phone: { type: 'string', example: '+8801712345678' },
                  city: { type: 'string', example: 'Dhaka' },
                  credit_limit: { type: 'number', example: 75000 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Customer created' },
        },
      },
    },
    '/api/erp/suppliers': {
      get: {
        tags: ['Suppliers (Procurement)'],
        summary: 'List All Suppliers',
        responses: {
          200: { description: 'Supplier list' },
        },
      },
      post: {
        tags: ['Suppliers (Procurement)'],
        summary: 'Register New Supplier',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phone', 'city'],
                properties: {
                  name: { type: 'string', example: 'Meghna Raw Materials' },
                  contact_person: { type: 'string', example: 'Rafiqul Islam' },
                  email: { type: 'string', example: 'procure@meghna.com' },
                  phone: { type: 'string', example: '+8801811223344' },
                  city: { type: 'string', example: 'Chittagong' },
                  payment_terms: { type: 'string', example: 'Net 30' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Supplier registered' },
        },
      },
    },
    '/api/items': {
      get: {
        tags: ['Inventory & Cache'],
        summary: 'List Items (Redis Cache-Aside)',
        description: 'Demonstrates sub-millisecond Redis cache hits vs Oracle DB queries.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, SKU, or category' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by status (ACTIVE / INACTIVE)' },
        ],
        responses: {
          200: {
            description: 'Item array with cache hit/miss metadata',
          },
        },
      },
      post: {
        tags: ['Inventory & Cache'],
        summary: 'Create New Inventory Item',
        description: 'Inserts row into Oracle DB and automatically invalidates Redis cache.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'sku', 'category', 'price'],
                properties: {
                  name: { type: 'string', example: 'Akij Ceramic Tile Premium 60x60' },
                  sku: { type: 'string', example: 'ACT-6060-PRM' },
                  category: { type: 'string', example: 'Ceramics' },
                  price: { type: 'number', example: 1250.00 },
                  stock_quantity: { type: 'integer', example: 500 },
                  description: { type: 'string', example: 'Glazed porcelain floor tile' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Item created' },
        },
      },
    },
    '/api/items/{id}': {
      get: {
        tags: ['Inventory & Cache'],
        summary: 'Get Item By ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Item details' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Inventory & Cache'],
        summary: 'Update Item Details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  category: { type: 'string' },
                  price: { type: 'number' },
                  stock_quantity: { type: 'integer' },
                  description: { type: 'string' },
                  status: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Item updated' } },
      },
      delete: {
        tags: ['Inventory & Cache'],
        summary: 'Delete Item',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Item deleted' } },
      },
    },
    '/api/items/cache/flush': {
      post: {
        tags: ['Inventory & Cache'],
        summary: 'Flush Redis Cache',
        description: 'Purges all cached item keys in Redis so that the subsequent query directly hits the Oracle DB.',
        responses: {
          200: { description: 'Cache successfully flushed' },
        },
      },
    },
    '/api/backup/history': {
      get: {
        tags: ['Disaster Recovery & Backup'],
        summary: 'View Azure Blob Storage Backup History',
        responses: {
          200: { description: 'List of backup archives and retention metadata' },
        },
      },
    },
    '/api/backup/trigger': {
      post: {
        tags: ['Disaster Recovery & Backup'],
        summary: 'Trigger On-Demand Oracle DB Backup',
        description: 'Dumps current Oracle database state, compresses it with Gzip, and uploads to Azure Blob Storage with automated 7-day retention enforcement.',
        responses: {
          200: { description: 'Backup successfully taken and uploaded' },
        },
      },
    },
  },
};

// Serve raw OpenAPI JSON specification
router.get('/swagger.json', (req, res) => {
  res.json(openApiSpec);
});

// Interactive Swagger UI HTML Page
router.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Akij ERP Cloud - Interactive API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .top-bar-branding {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #3b82f6;
    }
    .top-bar-branding h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; }
    .badge { background: #3b82f6; color: white; font-size: 11px; padding: 3px 8px; border-radius: 9999px; font-weight: 600; text-transform: uppercase; }
    .links a { color: #93c5fd; text-decoration: none; margin-left: 16px; font-size: 13px; font-weight: 500; }
    .links a:hover { text-decoration: underline; color: #ffffff; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div class="top-bar-branding">
    <h1>
      <span>🏢 Akij ERP Cloud</span>
      <span class="badge">Swagger UI (OpenAPI 3.0)</span>
    </h1>
    <div class="links">
      <a href="/api/health" target="_blank">Health Status</a>
      <a href="http://${req.hostname}:5341" target="_blank">Seq Logs (:5341)</a>
      <a href="https://witty-island-0a2d02300.5.azurestaticapps.net" target="_blank">Open ERP Web App</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(openApiSpec)};
      const ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        defaultModelsExpandDepth: -1,
        docExpansion: "list"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;

  res.send(html);
});

module.exports = router;
