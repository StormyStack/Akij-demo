const express = require('express');
const router = express.Router();
const { performOracleBackup, getBackupHistory } = require('../services/backupService');
const logger = require('../config/logger');

// GET /api/backup/history
router.get('/history', (req, res) => {
  try {
    const history = getBackupHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/backup/trigger (Allows on-demand backup testing from UI/curl)
router.post('/trigger', async (req, res) => {
  try {
    const result = await performOracleBackup('web_api_manual_trigger');
    const isCloudSuccess = result.azureUpload && result.azureUpload.success;
    res.json({
      success: true,
      message: isCloudSuccess
        ? 'Oracle DB backup completed successfully and uploaded to Azure Blob Storage!'
        : `Database backup archived locally. (${result.azureUpload?.error || result.azureUpload?.note})`,
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Database backup failed',
      error: err.message,
    });
  }
});

// GET /api/logs/status (Seq status)
router.get('/seq-status', (req, res) => {
  res.json({
    success: true,
    data: logger.getStatus(),
  });
});

module.exports = router;
