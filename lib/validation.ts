import { z } from 'zod';

export const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number.');

export const bookingSchema = z.object({
  customerId: z.string().min(1),
  serviceId: z.string().min(1),
  issue: z.string().min(10),
  address: z.string().min(8),
  preferredTime: z.string().min(1),
  notes: z.string().max(300).optional().nullable(),
  issuePhotoUrl: z.string().url().or(z.string().startsWith('/uploads/')).optional().nullable()
});

export const completeSchema = z.object({
  completionNote: z.string().min(5),
  finalAmount: z.number().int().positive().optional(),
  completionPhotoUrl: z.string().url().or(z.string().startsWith('/uploads/')).optional().nullable()
});

export const ratingSchema = z.object({
  reviewerId: z.string().min(1),
  rating: z.number().min(1).max(5),
  feedback: z.string().min(3)
});

export const disputeSchema = z.object({
  createdById: z.string().min(1),
  type: z.enum(['QUALITY_ISSUE', 'PAYMENT_ISSUE', 'CUSTOMER_NO_SHOW', 'WORKER_NO_SHOW', 'REWORK_REQUEST', 'PRICING_DISPUTE']),
  title: z.string().min(5),
  description: z.string().min(10)
});

export const workerApplicationSchema = z.object({
  name: z.string().min(2),
  phone: phoneSchema,
  city: z.string().min(2),
  area: z.string().min(2),
  experienceY: z.number().int().min(0).max(40),
  availability: z.string().min(3),
  bio: z.string().min(10),
  serviceIds: z.array(z.string()).min(1),
  idDocumentUrl: z.string().url().or(z.string().startsWith('/uploads/')).optional().nullable(),
  sampleWorkUrl: z.string().url().or(z.string().startsWith('/uploads/')).optional().nullable()
});

export const requestOtpSchema = z.object({
  phone: phoneSchema
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits.')
});

export const paymentVerificationSchema = z.object({
  orderId: z.string().min(3),
  paymentId: z.string().min(3),
  signature: z.string().min(8)
});
