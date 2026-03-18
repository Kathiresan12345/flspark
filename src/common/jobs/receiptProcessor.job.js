const { addReceiptJob } = require('../../common/queues/receipt.queue');

/**
 * Service to handle the logic of triggering the receipt processing pipeline.
 */
const queueReceiptProcessing = async (receiptId, imageUrl) => {
  // Logic to interact with BullMQ
  return await addReceiptJob(receiptId, imageUrl);
};

module.exports = { queueReceiptProcessing };
