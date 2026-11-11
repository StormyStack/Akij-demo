# Akij ERP — Enterprise Resource Planning Cloud Portal

A complete, production-ready **3-Tier Enterprise ERP Application** built for **Akij Group / Enterprise Operations**, designed to be hosted seamlessly on **Azure Static Web Apps** (Frontend) and an **Azure Virtual Machine with Docker** (Backend, Oracle DB, Redis, Seq, and Azure Blob Storage Backup).

---

## 🏢 Business ERP Modules

Instead of a raw technical portal, the application is structured as a full commercial Enterprise Resource Planning system:

1. **📊 Executive Operations Dashboard**:
   - Live commercial metrics: Gross Sales Revenue ($), Active Sales Orders, Inventory Valuation ($), and Reorder Alerts.
   - Recent Sales Orders ledger with workflow status actions.
   - Supply Chain & low stock alert widgets.
2. **📦 Inventory & Product Master**:
   - Product catalog with SKU, Category, Unit of Measure (UOM: `PCS`, `UNIT`, `BAG`, `BUNDLE`, `ROLL`, `KG`).
   - Cost Price vs. Selling Price and Gross Margin % calculation.
   - Real-time stock levels with safety reorder point notifications.
3. **🛒 Sales Orders & Dispatch Workflow**:
   - Commercial sales order ledger linked to registered customers.
   - Status workflow management: `PENDING` &rarr; `APPROVED` &rarr; `PROCESSING` &rarr; `SHIPPED` &rarr; `COMPLETED`.
   - Payment status tracking (`PAID`, `PARTIAL`, `UNPAID`).
4. **🚚 Procurement & Vendor Directory**:
   - Supplier database with vendor codes, contact representatives, phone, email, location, and payment terms (e.g. `Net 30`, `Net 15`).
5. **👥 Client & Customer Directory (CRM)**:
   - Wholesale customer accounts, contact representatives, and approved credit limits.
6. **⚙️ Cloud & System Administration (IT Operations)**:
   - Discreet administrative console for infrastructure status.
   - Oracle Database 23ai Free connection pool monitor.
   - Redis in-memory cache monitor and manual cache purge.
   - One-click link to the **Seq Centralized Logging Dashboard** (`http://<VM_IP>:5341`).
   - One-click **"Run Backup Now"** to test on-demand backup streaming to **Azure Blob Storage**.

---

## 📁 Repository Structure

```text
Demo Application/
├── docker-compose.yml           # Runs Oracle DB + Redis + Seq + Backend API + Backup Cron
├── deploy-azure-vm.sh           # 1-Command setup script for Azure Linux VM
├── .gitignore
├── README.md
│
├── backend/                     # TIER 2 & TIER 3 (Logic & Database)
│   ├── Dockerfile               # Node.js API & Backup Cron container
│   ├── package.json             # Express, oracledb, redis, @azure/storage-blob, node-cron
│   ├── .env                     # Local & Azure VM environment configuration
│   ├── sql/                     # Oracle Database SQL Scripts (Auto-mounted in Docker)
│   │   ├── 00_init_user.sql     # Optional: Oracle user & tablespace grant script
│   │   ├── 01_schema.sql        # DDL: SUPPLIERS, CUSTOMERS, ITEMS, SALES_ORDERS, ORDER_ITEMS
│   │   └── 02_seed_data.sql     # DML: Realistic enterprise ERP seed records
│   └── src/
│       ├── server.js            # Express server entrypoint & Seq request logger
│       ├── config/
│       │   ├── db.js            # Oracle DB pool + resilient fallback ERP models
│       │   ├── redis.js         # Redis cache client & query cache-aside
│       │   └── logger.js        # Seq structured logging (CLEF format)
│       ├── routes/
│       │   ├── erp.js           # ERP Dashboard, Orders, Customers, Suppliers endpoints
│       │   ├── items.js         # Inventory CRUD endpoints
│       │   └── backup.js        # Azure Blob backup trigger & history
│       └── services/
│           └── backupService.js # Oracle dump + Gzip compression + Azure Blob upload
│
└── frontend/                    # TIER 1 (Presentation)
    ├── staticwebapp.config.json # Azure Static Web Apps configuration (routing & CORS)
    ├── package.json             # React 18, Vite, Tailwind CSS, Lucide Icons
    ├── vite.config.js           # Vite build config
    └── src/
        ├── App.jsx              # Main ERP Application shell
        ├── components/
        │   ├── erp/
        │   │   ├── ErpSidebar.jsx       # Left navigation with active badges
        │   │   ├── ErpHeader.jsx        # Top bar with quick create, search, alerts
        │   │   ├── ErpDashboard.jsx     # Executive Operations Dashboard
        │   │   ├── OrdersModule.jsx     # Sales Orders & Dispatch workflow
        │   │   ├── SuppliersModule.jsx  # Vendor directory & procurement
        │   │   ├── CustomersModule.jsx  # Customer directory & credit limits
        │   │   ├── SystemAdminModule.jsx# Cloud infrastructure & observability hub
        │   │   ├── NewOrderModal.jsx    # Create sales order dialog
        │   │   ├── NewCustomerModal.jsx # Register customer dialog
        │   │   └── NewSupplierModal.jsx # Register vendor dialog
        │   ├── ItemTable.jsx            # Inventory Product Master view
        │   ├── ItemModal.jsx            # Create/Edit product dialog
        │   └── AzureConfigModal.jsx     # In-browser Azure VM endpoint switcher
```

---

## ☁️ Deployment Guide

### 1. Azure Linux VM (Backend, Oracle DB, Redis, Seq, Backup Cron)
1. In the **Azure Portal**, create an **Ubuntu 22.04 / 24.04 VM** (e.g. `Standard_B2s` or `Standard_D2s_v5`).
2. In the VM **Network Security Group (NSG)**, add inbound rules for:
   - **Port 5000** (Backend REST API)
   - **Port 5341** (Seq Logging Dashboard)
   - Optional: **Port 1521** (Direct Oracle DB access)
3. SSH into the VM, clone your repo, and run:
   ```bash
   chmod +x deploy-azure-vm.sh
   ./deploy-azure-vm.sh
   ```

### 2. Azure Static Web Apps (Frontend)
1. In the **Azure Portal**, create an **Azure Static Web App** linked to your GitHub repository.
2. In **Build Details**:
   - **Build Preset**: `Vite`
   - **App location**: `/frontend`
   - **Output location**: `dist`
3. In **Configuration**, set:
   - `VITE_API_URL` = `http://<AZURE_VM_PUBLIC_IP>:5000`
4. Or open the deployed URL, click **Settings (⚙️)** in the top bar, and paste `http://<AZURE_VM_PUBLIC_IP>:5000`.

---

## 🔍 Centralized Logging & Azure Blob DB Backup

- **Seq Logging Dashboard**: Open `http://<AZURE_VM_PUBLIC_IP>:5341` in any browser to inspect live ERP logs, sales transactions, errors, and database query durations.
- **Hourly DB Backup**: Automatically dumps Oracle DB schema and tables every 1 hour (`0 * * * *`), compresses to `.sql.gz`, and uploads to your Azure Storage Account Blob container (`oracle-backups`).
