const { Queue } = require('bullmq');
const redis = require('../../config/redis');

const schedulerQueue = new Queue('scheduler', {
  connection: redis,
});

const setupScheduledJobs = async () => {
  // Expiry Alert Job - Daily at 8 AM
  await schedulerQueue.add(
    'expiry-alert',
    {},
    {
      repeat: {
        pattern: '0 8 * * *', // Every day at 8:00 AM
      },
    }
  );
  
  console.log('Scheduled jobs initialized.');
};

module.exports = { setupScheduledJobs };
