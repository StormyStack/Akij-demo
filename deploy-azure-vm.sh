#!/usr/bin/env bash
# ==========================================================
# 3-Tier Enterprise PoC - Azure VM Provisioning Script
# This script sets up Docker, Docker Compose, and starts
# the Oracle DB + Redis + Backend API on Ubuntu/Debian Azure VM.
# ==========================================================

set -e

echo "=========================================================="
echo "  Deploying 3-Tier Backend on Azure VM (Docker)"
echo "=========================================================="

# 1. Update and install prerequisites
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# 2. Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "[1/3] Installing Docker..."
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
echo "[2/3] Building and starting containers (Oracle DB, Redis, Backend API)..."
sudo docker compose up -d --build

echo "[3/3] Checking container status..."
sudo docker compose ps

echo "=========================================================="
echo "  Deployment Complete! 🚀"
echo "  - Backend REST API: http://$(curl -s ifconfig.me):5000"
echo "  - Health Check:     http://$(curl -s ifconfig.me):5000/api/health"
echo "  - Oracle DB Port:   1521 (FREEPDB1)"
echo "  - Redis Port:       6379"
echo "=========================================================="
echo "IMPORTANT: In Azure Portal, ensure your VM Network Security Group (NSG)"
echo "has Inbound Security Rules allowing Port 5000 (and 1521 if accessing DB remotely)."
echo "=========================================================="
