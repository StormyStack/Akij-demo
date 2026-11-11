#!/usr/bin/env bash
# ==========================================================
# Akij Enterprise ERP - Azure VM Provisioning Script
# Architecture:
#   Frontend (Azure SWA) -> Nginx -> Backend API
#   Backend -> Oracle DB 23ai + Redis + Seq Logs
#   DB Backup (12hr Cron + Retention Policy) -> Azure Blob Storage
# ==========================================================

set -e

echo "=========================================================="
echo "  Deploying Akij ERP Enterprise Stack on Azure VM (Docker)"
echo "  Components: Nginx + Backend API + Oracle DB + Redis + Seq + Backup Cron (12h)"
echo "=========================================================="

# 1. Update and install prerequisites
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 2. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "[1/3] Installing Docker Engine & Compose plugin..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "Docker installed successfully!"
else
    echo "[1/3] Docker is already installed."
fi

# 3. Pull images and launch Docker Compose stack
echo "[2/3] Building and starting all 6 containers..."
sudo docker compose up -d --build

echo "[3/3] Checking container status..."
sudo docker compose ps

VM_IP=$(curl -s ifconfig.me || echo "AZURE_VM_PUBLIC_IP")

echo "=========================================================="
echo "  Enterprise Deployment Complete! 🚀"
echo "  - Nginx Gateway:    http://${VM_IP} (Port 80)"
echo "  - Backend REST API: http://${VM_IP}/api/health"
echo "  - Direct API Port:  http://${VM_IP}:5000/api/health"
echo "  - Seq Log Server:   http://${VM_IP}:5341"
echo "  - Oracle DB Port:   1521 (FREEPDB1)"
echo "  - Redis Port:       6379"
echo "  - DB Backup Cron:   Every 12 Hours with Retention Policy (Azure Blob)"
echo "=========================================================="
echo "IMPORTANT: In Azure Portal, ensure your VM Network Security Group (NSG)"
echo "Inbound Security Rules allow:"
echo "  - Port 80   (Nginx Ingress - Recommended for SWA)"
echo "  - Port 5000 (Backend API Direct)"
echo "  - Port 5341 (Seq Logging Web Dashboard)"
echo "  - Port 1521 (Optional: Direct Oracle DB access)"
echo "=========================================================="
