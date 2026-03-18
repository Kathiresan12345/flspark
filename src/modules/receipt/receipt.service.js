const prisma = require('../../config/database');
const { addReceiptJob } = require('../../common/queues/receipt.queue');

const createReceipt = async (userId, imageUrl) => {
  return await prisma.receipt.create({
    data: {
      userId,
      imageUrl,
      processingStatus: 'uploaded',
    },
  });
};

const queueReceiptProcessing = async (receiptId, userId) => {
  const receipt = await prisma.receipt.findFirst({
    where: { id: receiptId, userId },
  });

  if (!receipt) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  await prisma.receipt.update({
    where: { id: receiptId },
    data: { processingStatus: 'processing' },
  });

  await addReceiptJob(receiptId, receipt.imageUrl);
};

const getReceiptWithItems = async (receiptId, userId) => {
  const receipt = await prisma.receipt.findFirst({
    where: { id: receiptId, userId },
    include: { items: true },
  });

  if (!receipt) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  return receipt;
};

const confirmReceiptItems = async (receiptId, userId, itemsToConfirm) => {
  const receipt = await prisma.receipt.findFirst({
    where: { id: receiptId, userId },
    include: { items: true },
  });

  if (!receipt) {
    const error = new Error('Receipt not found');
    error.statusCode = 404;
    throw error;
  }

  const results = [];
  for (const confirmData of itemsToConfirm) {
    const receiptItem = receipt.items.find(i => i.id === confirmData.receipt_item_id);
    if (!receiptItem) continue;

    // Add to pantry
    const pantryItem = await prisma.pantryItem.create({
      data: {
        userId,
        itemName: receiptItem.itemName,
        normalizedName: receiptItem.normalizedName || receiptItem.itemName.toLowerCase().trim(),
        quantity: receiptItem.quantity,
        unit: receiptItem.unit,
        category: receiptItem.category,
        expiryDate: confirmData.expiry_date ? new Date(confirmData.expiry_date) : null,
        source: 'receipt',
      },
    });

    // Mark receipt item as confirmed
    await prisma.receiptItem.update({
      where: { id: receiptItem.id },
      data: { isConfirmed: true },
    });

    results.push(pantryItem);
  }

  return results;
};

module.exports = {
  createReceipt,
  queueReceiptProcessing,
  getReceiptWithItems,
  confirmReceiptItems,
};
