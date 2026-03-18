const { z } = require('zod');

const confirmReceiptItemsSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      receipt_item_id: z.string().uuid(),
      expiry_date: z.string().optional(),
    })).min(1),
  }),
});

module.exports = {
  confirmReceiptItemsSchema,
};
