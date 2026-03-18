const { z } = require('zod');

const syncUserSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Firebase token is required'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
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
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
