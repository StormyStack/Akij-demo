# 3-Tier Enterprise Demo Application (Azure & Oracle DB)

A complete, production-ready **3-Tier Enterprise Application** designed for rapid Proof-of-Concept (PoC) deployment:
- **Presentation Tier**: **React 18 (Vite + Tailwind CSS)** configured for **Azure Static Web Apps**
- **Logic Tier**: **Node.js Express REST API** containerized with Docker for **Azure Virtual Machine (VM)**
- **Data & Caching Tier**: **Oracle Database 23ai Free** + **Redis 7 Cache** running via Docker Compose
- **Observability & Resilience**: **Seq Structured Logging Server** + **Hourly Cronjob DB Backup to Azure Blob Storage**

---

## 📁 Repository Structure

```text
Demo Application/
├── docker-compose.yml           # Multi-container orchestration (Oracle, Redis, Seq, Backend, DB Backup)
├── deploy-azure-vm.sh           # 1-Command setup script for Azure Linux VM
├── .gitignore
├── README.md
│
├── backend/                     # TIER 2 & TIER 3 (Logic, Database & Observability)
│   ├── Dockerfile               # Production container for Express API & Backup Cron
│   ├── package.json             # Express, oracledb, redis, @azure/storage-blob, node-cron
│   ├── .env.example             # Environment configuration template
│   ├── sql/                     # Oracle Database SQL Scripts (Auto-mounted into container)
│   │   ├── 00_init_user.sql     # Optional: Oracle user & tablespace grant script
│   │   ├── 01_schema.sql        # DDL: ITEMS table, constraints, trigger, indexes
│   │   └── 02_seed_data.sql     # DML: Demo seed records
│   └── src/
│       ├── server.js            # Express server entrypoint & Seq request logger
│       ├── config/
│       │   ├── db.js            # Oracle DB connection pool (node-oracledb)
│       │   ├── redis.js         # Redis cache client & hit/miss metrics
│       │   └── logger.js        # Seq structured logging client (CLEF format)
│       ├── controllers/
│       │   └── itemsController.js # CRUD operations + Redis caching logic
│       ├── routes/
│       │   ├── items.js         # REST endpoints (/api/items)
│       │   └── backup.js        # DB backup triggers & Seq status (/api/backup)
│       ├── services/
│       │   └── backupService.js # Oracle dump + Gzip compression + Azure Blob upload
│       └── scripts/
│           ├── initDb.js        # Database table initialization script
│           ├── backupCron.js    # Hourly cronjob scheduler (0 * * * *)
│           └── backupRunner.js  # One-shot manual backup CLI
│
└── frontend/                    # TIER 1 (Presentation)
    ├── staticwebapp.config.json # Azure Static Web Apps configuration (routing & CORS)
    ├── package.json             # React 18, Vite, Lucide Icons, Tailwind CSS
    ├── vite.config.js           # Vite build config with dev proxy
    ├── index.html
    ├── .env                     # Local API base URL
    ├── .env.production          # Azure VM API base URL template
    └── src/
        ├── App.jsx              # Main UI with 3-tier tracer & live metrics
        ├── components/
        │   ├── ArchitectureBar.jsx # Visual 3-tier status & Redis Cache Flush button
        │   ├── ObservabilityBar.jsx# Seq Logging status & Azure Blob backup trigger
        │   ├── StatsCards.jsx      # Inventory valuation & summary KPIs
        │   ├── ItemTable.jsx       # CRUD table with search & category filters
        │   ├── ItemModal.jsx       # Create / Edit modal dialog
        │   └── AzureConfigModal.jsx# In-browser Azure VM endpoint switcher
        └── index.css            # Tailwind styles & cache hit/miss animations
```

---

## 🔍 Seq Centralized Logging (`http://<VM_IP>:5341`)

Seq runs in Docker via the `datalust/seq:latest` image and provides a real-time web dashboard for structured log search, alerting, and analysis.

- **Web Dashboard**: Access at `http://<AZURE_VM_PUBLIC_IP>:5341` (No authentication required by default in PoC mode).
- **Log Stream Format**: Events are streamed asynchronously using the **CLEF (Compact Log Event Format)** standard.
- **Captured Events**:
  - HTTP requests with method, path, response status, and duration in ms.
  - Oracle DB pool connection and query execution times.
  - Redis cache hits vs. cache misses.
  - Hourly database backup start, compression size (KB), and Azure Blob Storage upload status.

---

## ☁️ Azure Storage Account (Blob Storage) DB Backup

### How it works
1. **Cronjob Schedule**: Runs **every 1 hour** (`0 * * * *`) via the `db-backup` container.
2. **Export & Compression**: Connects to Oracle DB, exports schema DDL + table rows, and compresses the dump into `oracle_backup_YYYY-MM-DDTHH-mm-ss.sql.gz` using Gzip.
3. **Upload to Azure Blob**: Directly uploads the compressed archive to your Azure Storage Account Blob container (default: `oracle-backups`).
4. **Seq Audit Trail**: Emits structured log events to Seq with backup size, row counts, and Azure blob URLs.
5. **On-Demand Trigger**: You can run an instant backup at any time by clicking **"Run Backup Now"** in the frontend UI or by calling `POST /api/backup/trigger`.

### Configuring your Azure Storage Account
In `backend/.env` (or via Azure VM environment variables):
```env
# Azure Storage Account Connection String
# Found in: Azure Portal > Storage Account > Security + networking > Access keys > Connection string
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=<YOUR_STORAGE_ACCOUNT>;AccountKey=<YOUR_ACCESS_KEY>;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME="oracle-backups"
BACKUP_CRON_SCHEDULE="0 * * * *"
```

---

## 🗄️ Oracle Database Scripts (`backend/sql/`)

| File | Purpose |
| :--- | :--- |
| `00_init_user.sql` | Grants privileges and creates `poc_user` with `poc_password` |
| `01_schema.sql` | Creates `ITEMS` table with identity primary key, checks, triggers, and indexes |
| `02_seed_data.sql` | Inserts rich starter items (Electronics, Peripherals, Furniture, Computers) |

The scripts are automatically executed when mounted into the Oracle Free container (`/container-entrypoint-initdb.d:ro`).

---

## ⚡ Redis Caching Layer

- **Cache-Aside Pattern**: `GET /api/items` queries Redis first (`items:list:...`).
  - **Hit**: Returns cached JSON in `< 5ms` with `source: "redis_cache"`.
  - **Miss**: Queries Oracle DB (~50-100ms), sets Redis cache with a 60-second TTL, and returns `source: "oracle_database"`.
- **Automatic Invalidation**: Creating, updating, or deleting items invalidates all `items:*` Redis keys.
- **Interactive Flush Button**: The frontend header provides a **"Flush Redis Cache"** button to demonstrate cache miss vs cache hit latency directly during PoC demos.

---

## 🚀 Deployment Guide: Azure VM (Backend, Oracle DB, Redis, Seq, Backup)

### Step 1: Create an Azure Linux VM
- **Image**: Ubuntu Server 22.04 LTS or 24.04 LTS
- **Size**: Recommended `Standard_B2s` (2 vCPUs, 4 GiB RAM) or `Standard_D2s_v5` (2 vCPUs, 8 GiB RAM)
- **Networking**: In Azure Portal > Your VM > **Networking** > **Network Security Group (NSG)**:
  - Allow **Port 5000** (Backend API)
  - Allow **Port 5341** (Seq Logging Dashboard)
  - Optional: Allow **Port 1521** (Direct Oracle DB access from DBeaver / SQL Developer)

### Step 2: Deploy Containers to the Azure VM
SSH into your Azure VM:
```bash
ssh azureuser@<AZURE_VM_PUBLIC_IP>
```

Clone your repository or copy this project to the VM:
```bash
git clone <YOUR_REPO_URL> demo-app
cd demo-app
```

Add your Azure Storage connection string to `backend/.env`:
```bash
nano backend/.env
# Set AZURE_STORAGE_CONNECTION_STRING="your_connection_string"
```

Run the automated provisioning script:
```bash
chmod +x deploy-azure-vm.sh
./deploy-azure-vm.sh
```

All 5 services will start:
1. `poc-oracle-db` (Oracle Database 23ai Free)
2. `poc-redis` (Redis Cache 7 Alpine)
3. `poc-seq-logs` (Seq Log Server on port 5341)
4. `poc-backend-api` (Express REST API on port 5000)
5. `poc-db-backup` (Hourly Azure Blob DB Backup Cron)

Verify:
```bash
sudo docker compose ps
curl http://localhost:5000/api/health
```

---

## 🌐 Deployment Guide: Azure Static Web Apps (Frontend)

1. In the **Azure Portal**, search for **Static Web Apps** and click **Create**.
2. Select Subscription, Resource Group, and link your **GitHub** repo.
3. Under **Build Details**:
   - **Build Preset**: `Vite`
   - **App location**: `/frontend`
   - **Api location**: *(leave empty)*
   - **Output location**: `dist`
4. In the deployed Static Web App **Configuration**, add:
   - `VITE_API_URL` = `http://<AZURE_VM_PUBLIC_IP>:5000`
5. *Alternatively*, open your deployed Static Web App URL in any browser, click **"API Config"**, and paste `http://<AZURE_VM_PUBLIC_IP>:5000`.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health for all tiers (Oracle, Redis, Seq, Backup) |
| `GET` | `/api/items` | List items (with query filters `search`, `category`) |
| `POST` | `/api/items` | Create new item (invalidates cache) |
| `PUT` | `/api/items/:id` | Update item (invalidates cache) |
| `DELETE` | `/api/items/:id` | Delete item (invalidates cache) |
| `POST` | `/api/items/cache/flush` | Purge all Redis cached items |
| `POST` | `/api/backup/trigger` | Trigger on-demand DB backup to Azure Blob Storage |
| `GET` | `/api/backup/history` | List recent backup history & Azure container status |
| `GET` | `/api/backup/seq-status` | Get Seq logging ingestion status |
