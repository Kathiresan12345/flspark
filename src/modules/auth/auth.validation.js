const { z } = require('zod');

const syncUserSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Firebase token is required'),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    dietPreference: z.string().optional(),
    allergies: z.any().optional(),
    householdSize: z.number().int().min(1).optional(),
  }),
});

module.exports = {
  syncUserSchema,
  updateProfileSchema,
};
