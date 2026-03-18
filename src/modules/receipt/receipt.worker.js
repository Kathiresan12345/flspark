const { Worker } = require('bullmq');
const redis = require('../../config/redis');
const visionClient = require('../../config/vision');
const { parseReceiptText } = require('../recipe/gemini.service');
const prisma = require('../../config/database');

const processor = async (job) => {
  const { receiptId, imageUrl } = job.data;
  console.log(`Processing receipt: ${receiptId}`);

  try {
    // 1. Google Vision OCR
    // Note: In local env, imageUrl might be a local path. Vision needs a buffer or GCS URI.
    // For this demo, we assume the file is readable locally.
    const [result] = await visionClient.textDetection(imageUrl);
    const detections = result.textAnnotations;
    const rawText = detections.length > 0 ? detections[0].description : '';

    if (!rawText) {
      throw new Error('No text found in receipt image');
    }

    // Update receipt with raw OCR text
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { ocrRawText: rawText },
    });

    // 2. Gemini Parse
    const structuredItems = await parseReceiptText(rawText);

    // 3. Save Receipt Items
    const itemRecords = structuredItems.map(item => ({
      receiptId,
      itemName: item.item_name,
      normalizedName: item.normalized_name,
      quantity: item.quantity ? parseFloat(item.quantity) : null,
      unit: item.unit,
      category: item.category,
      confidenceScore: item.confidence_score ? parseFloat(item.confidence_score) : null,
    }));

    // Create many records
    await prisma.receiptItem.createMany({
      data: itemRecords,
    });

    // 4. Mark Complete
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { processingStatus: 'completed' },
    });

    console.log(`Successfully processed receipt: ${receiptId}`);
  } catch (error) {
    console.error(`Error processing receipt ${receiptId}:`, error);
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { 
        processingStatus: 'failed',
        errorMessage: error.message 
      },
    });
    throw error;
  }
};

const receiptWorker = new Worker('receipt-processing', processor, {
  connection: redis,
});

receiptWorker.on('completed', job => {
  console.log(`Job ${job.id} completed!`);
});

receiptWorker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with ${err.message}`);
});

module.exports = receiptWorker;
