const receiptService = require('./receipt.service');

const uploadReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // In a real app, you'd upload to S3 here and get a URL
    const imageUrl = req.file.path; 
    const receipt = await receiptService.createReceipt(req.user.id, imageUrl);
    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

const processReceipt = async (req, res, next) => {
  try {
    await receiptService.queueReceiptProcessing(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Processing queued' });
  } catch (error) {
    next(error);
  }
};

const getReceiptStatus = async (req, res, next) => {
  try {
    const receipt = await receiptService.getReceiptWithItems(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    next(error);
  }
};

const confirmItems = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { receipt_item_id, expiry_date }
    await receiptService.confirmReceiptItems(req.params.id, req.user.id, items);
    res.status(200).json({ success: true, message: 'Items confirmed and added to pantry' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReceipt,
  processReceipt,
  getReceiptStatus,
  confirmItems,
};
