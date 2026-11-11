const cron = require('node-cron');
const { performOracleBackup, applyRetentionPolicy, BACKUP_RETENTION_DAYS } = require('../services/backupService');
const logger = require('../config/logger');
require('dotenv').config();

// Default schedule: Every 12 hours matching architecture diagram (0 */12 * * *)
const CRON_SCHEDULE = process.env.BACKUP_CRON_SCHEDULE || '0 */12 * * *';

console.log('========================================================');
console.log('  🕒 Oracle DB Azure Blob Backup & Retention Cron');
console.log(`  Schedule:  "${CRON_SCHEDULE}" (Every 12 Hours)`);
console.log(`  Retention: Last ${BACKUP_RETENTION_DAYS} Days`);
console.log(`  Container: "${process.env.AZURE_STORAGE_CONTAINER_NAME || 'oracle-backups'}"`);
console.log('========================================================');

logger.info('[DB Backup Cron] Scheduler initialized', {
  Schedule: CRON_SCHEDULE,
  RetentionDays: BACKUP_RETENTION_DAYS,
  AzureContainer: process.env.AZURE_STORAGE_CONTAINER_NAME || 'oracle-backups',
  StorageConfigured: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
});

// Run an initial backup check after 30 seconds once DB has warmed up
setTimeout(async () => {
  try {
    logger.info('[DB Backup Cron] Running initial startup backup & retention verification...');
    await performOracleBackup('startup_initial_check');
  } catch (err) {
    logger.warn('[DB Backup Cron] Initial backup verification deferred (DB may still be starting):', { error: err.message });
  }
}, 30000);

// Schedule the 12-hour cronjob with retention policy
cron.schedule(CRON_SCHEDULE, async () => {
  const runTime = new Date().toISOString();
  console.log(`[DB Backup Cron] [${runTime}] Triggering scheduled 12-hour Oracle DB backup & retention policy...`);
  try {
    const result = await performOracleBackup('12hr_cronjob');
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
