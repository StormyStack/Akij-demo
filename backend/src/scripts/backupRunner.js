const { performOracleBackup } = require('../services/backupService');

async function main() {
  console.log('[DB Backup CLI] Triggering on-demand Oracle DB backup...');
  try {
    const result = await performOracleBackup('cli_manual_run');
    console.log('✅ Backup finished successfully!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('❌ Backup failed:', err.message);
    process.exit(1);
  }
}

main();
