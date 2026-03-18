const express = require('express');
const router = express.Router();
const multer = require('multer');
const receiptController = require('./receipt.controller');
const { authMiddleware } = require('../../common/middleware/auth.middleware');
const { validate } = require('../../common/middleware/validate.middleware');
const { confirmReceiptItemsSchema } = require('./receipt.validation');

const upload = multer({ dest: 'uploads/' }); // In production use S3/Firebase Storage

router.use(authMiddleware);

router.post('/upload', upload.single('receipt'), receiptController.uploadReceipt);
router.post('/:id/process', receiptController.processReceipt);
router.get('/:id', receiptController.getReceiptStatus);
router.post('/:id/confirm', validate(confirmReceiptItemsSchema), receiptController.confirmItems);

module.exports = router;
