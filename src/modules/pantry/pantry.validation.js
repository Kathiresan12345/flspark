const { z } = require('zod');

const addPantryItemSchema = z.object({
  body: z.object({
    itemName: z.string().min(1),
    quantity: z.number().optional(),
    unit: z.string().optional(),
    category: z.string().optional(),
    expiryDate: z.string().optional(), // ISO date string
    source: z.enum(['manual', 'receipt', 'ai_inferred']).optional(),
  }),
});

const updatePantryItemSchema = z.object({
  body: z.object({
    quantity: z.number().optional(),
    unit: z.string().optional(),
    expiryDate: z.string().optional(),
  }),
});

module.exports = {
  addPantryItemSchema,
  updatePantryItemSchema,
};
