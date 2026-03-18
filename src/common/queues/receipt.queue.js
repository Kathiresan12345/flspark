const { Queue } = require('bullmq');
const redis = require('../../config/redis');

const receiptQueue = new Queue('receipt-processing', {
  connection: redis,
});

const addReceiptJob = async (receiptId, imageUrl) => {
  await receiptQueue.add('process-receipt', { receiptId, imageUrl });
};

module.exports = {
  receiptQueue,
  addReceiptJob,
};
