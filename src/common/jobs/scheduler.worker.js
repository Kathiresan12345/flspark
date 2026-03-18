const { Worker } = require('bullmq');
const redis = require('../../config/redis');
const { runExpiryAlertJob } = require('../jobs/expiryAlert.job');

const schedulerWorker = new Worker(
  'scheduler',
  async (job) => {
    if (job.name === 'expiry-alert') {
      await runExpiryAlertJob();
    }
  },
  { connection: redis }
);

schedulerWorker.on('completed', (job) => {
  console.log(`Scheduled job ${job.name} completed.`);
});

schedulerWorker.on('failed', (job, err) => {
  console.error(`Scheduled job ${job.name} failed:`, err);
});

module.exports = schedulerWorker;
