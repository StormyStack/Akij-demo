# Akij Enterprise ERP — 3-Tier Architecture on Azure

A production-ready **3-Tier Enterprise ERP Application** implemented on **Microsoft Azure**, directly translated from the enterprise reference architecture:

---

## 🗺️ AWS to Azure Architecture Mapping

| Diagram Component (AWS) | Our Implementation on Azure | Technology / Role |
|:---|:---|:---|
| **Users** | Web Browsers / Client Devices | End-users accessing Akij ERP Portal |
| **AWS Amplify (Frontend)** | **Azure Static Web Apps (SWA)** | React 18, Vite, Tailwind CSS (Global Edge CDN) |
| **Amazon EC2 (VPC)** | **Azure Virtual Machine (VNet)** | Ubuntu 22.04 / 24.04 Linux Host |
| **Nginx** | **Nginx Ingress Reverse Proxy** | Docker container listening on Port 80 (and 443 SSL) |
| **Backend** | **Node.js Express REST API** | Logic Tier (Port 5000 / Internal `backend:5000`) |
| **SEQ** | **Seq Structured Logging Server** | Real-time CLEF telemetry & query logging (Port 5341) |
| **Redis** | **Redis 7 Cache** | In-Memory Query Cache with auto-invalidation (Port 6379) |
| **Oracle DB** | **Oracle Database 23ai Free** | Relational Database Tier (Port 1521 / `FREEPDB1`) |
| **cronjob Every 12hrs** | **Node-Cron Scheduler** | Scheduled every 12 hours: `0 */12 * * *` |
| **DB Backup with Retention Policy** | **Automated Backup & Retention Worker** | Gzip dumps + Auto-purge backups older than 7 days |
| **Amazon S3** | **Azure Storage Account Blob Container** | Cloud archive container (`oracle-backups`) |

---

## 🔄 End-to-End Request & Data Flow

```text
[Users / Clients]
       │
       ▼ (HTTPS)
[Azure Static Web Apps (SWA)]  <-- React 18 / Vite ERP Portal
       │
       ▼ (API Requests: /api/...)
[Nginx Reverse Proxy]          <-- Ingress Gateway on Azure VM (Port 80)
       │
       ▼ (Internal Proxy)
[Node.js Express Backend API]  <-- Logic Tier
       ├──► [Seq Logging Server] (Port 5341) - Centralized Telemetry & Audit
       ├──► [Redis In-Memory Cache] (Port 6379) - Sub-5ms Query Cache
       ├──► [Oracle Database 23ai] (Port 1521) - ERP Relational Tables
       └──► [Azure Blob Storage] - Document & Asset Storage

[DB Backup Worker] (Cronjob Every 12 Hours: 0 */12 * * *)
       ├──► Dumps schema & tables from [Oracle DB]
       ├──► Compresses dump to Gzip (.sql.gz)
       ├──► Streams archive to [Azure Storage Account Blob Container]
       └──► Enforces Retention Policy: Purges backups older than 7 days
```

---

## 📁 Repository Structure

```text
Demo Application/
├── docker-compose.yml           # Multi-container stack (Nginx, Backend, Oracle, Redis, Seq, Backup)
├── deploy-azure-vm.sh           # 1-Command VM setup script
├── nginx/
│   └── nginx.conf               # Nginx reverse proxy routing /api & /seq
├── backend/                     # TIER 2 & TIER 3 (Logic & Database)
│   ├── Dockerfile               # Node.js API container
│   ├── package.json             # Express, oracledb, redis, @azure/storage-blob, node-cron
│   ├── .env                     # VM environment configuration
│   ├── sql/                     # Oracle SQL Scripts (Auto-mounted into Oracle container)
│   │   ├── 00_init_user.sql     # User creation & grants
│   │   ├── 01_schema.sql        # DDL: SUPPLIERS, CUSTOMERS, ITEMS, SALES_ORDERS, ORDER_ITEMS
│   │   └── 02_seed_data.sql     # DML: Demo records for products, customers, and orders
│   └── src/
│       ├── server.js            # Express server entrypoint
│       ├── config/              # Oracle DB, Redis, and Seq logger configs
│       ├── routes/              # ERP endpoints (/api/erp, /api/items, /api/backup)
│       ├── services/
│       │   └── backupService.js # Oracle dump + Gzip + Azure Blob + 7-Day Retention Policy
│       └── scripts/
│           └── backupCron.js    # 12-Hour Cron runner (0 */12 * * *)
└── frontend/                    # TIER 1 (Presentation)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx              # Akij ERP Application Shell
        └── components/erp/      # Dashboard, Inventory, Orders, Vendors, CRM, System Admin
```

---

## ☁️ Azure Deployment Instructions

### 1. Azure Linux VM (Backend, Nginx, Oracle DB, Redis, Seq, Backup)
1. In the **Azure Portal**, create an **Ubuntu Linux VM** (e.g. `Standard_B2s` or `Standard_D2s_v5`).
2. In the VM **Network Security Group (NSG)**, allow inbound ports:
   - **Port 80** (Nginx Ingress — Primary API endpoint)
   - **Port 5000** (Direct Express API)
   - **Port 5341** (Seq Structured Logging Dashboard)
   - Optional: **Port 1521** (Direct Oracle DB access)
3. SSH into the VM, clone your repository, configure `backend/.env`, and run:
   ```bash
   chmod +x deploy-azure-vm.sh
   ./deploy-azure-vm.sh
   ```

### 2. Azure Static Web Apps (Frontend)
1. In the **Azure Portal**, create a **Static Web App** linked to your GitHub repository.
2. In the GitHub Actions workflow, the frontend compiles with Vite and uploads the `dist/` bundle automatically.
3. In **Settings &rarr; Environment variables** (or via the in-app **⚙️ Configure Endpoint** dialog), set:
   - `VITE_API_URL` = `http://<YOUR_AZURE_VM_PUBLIC_IP>` (routed through Nginx on Port 80)

---

## 🕒 12-Hour Backup & Retention Policy

- **Cron Schedule**: `0 */12 * * *` (fires automatically at 00:00 and 12:00 every day).
- **Retention**: Automatically cleans up local files and Azure Blob archives older than `BACKUP_RETENTION_DAYS` (default: 7 days).
- **Manual Trigger**: Click **"Run Backup Now"** under the **Cloud & System Admin** tab in the ERP interface to test instant streaming to Azure Blob Storage anytime.
