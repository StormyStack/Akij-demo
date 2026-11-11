const cron = require('node-cron');
const { performOracleBackup } = require('../services/backupService');
const logger = require('../config/logger');
require('dotenv').config();

const CRON_SCHEDULE = process.env.BACKUP_CRON_SCHEDULE || '0 * * * *'; // Every 1 hour

console.log('========================================================');
console.log('  🕒 Oracle DB Azure Blob Storage Backup Cron Service');
console.log(`  Schedule: "${CRON_SCHEDULE}" (Every 1 hour)`);
console.log(`  Container: "${process.env.AZURE_STORAGE_CONTAINER_NAME || 'oracle-backups'}"`);
console.log('========================================================');

logger.info('[DB Backup Cron] Scheduler initialized', {
  Schedule: CRON_SCHEDULE,
  AzureContainer: process.env.AZURE_STORAGE_CONTAINER_NAME || 'oracle-backups',
  StorageConfigured: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
});

// Run an initial backup check after 30 seconds once DB has warmed up
setTimeout(async () => {
  try {
    logger.info('[DB Backup Cron] Running initial startup backup verification...');
    await performOracleBackup('startup_initial_check');
  } catch (err) {
    logger.warn('[DB Backup Cron] Initial backup verification deferred (DB may still be starting):', { error: err.message });
  }
}, 30000);

// Schedule the hourly cronjob
cron.schedule(CRON_SCHEDULE, async () => {
  const runTime = new Date().toISOString();
  console.log(`[DB Backup Cron] [${runTime}] Triggering scheduled hourly Oracle DB backup...`);
  try {
    const result = await performOracleBackup('hourly_cronjob');
    console.log(`[DB Backup Cron] Successfully completed backup: ${result.filename} (${result.sizeKb} KB)`);
  } catch (err) {
    console.error(`[DB Backup Cron] Error during scheduled backup:`, err.message);
  }
});

// Keep process alive
process.on('SIGTERM', () => {
  logger.info('[DB Backup Cron] Received SIGTERM, exiting gracefully');
  process.exit(0);
});
