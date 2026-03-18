const app = require('./app');
const http = require('http');

// Start Workers
require('./modules/receipt/receipt.worker');
const { setupScheduledJobs } = require('./common/queues/scheduler.queue');
require('./common/jobs/scheduler.worker');

setupScheduledJobs();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
