import crypto from 'crypto';

const provider = process.env.PAYMENT_PROVIDER || 'mock';

export function createHeldPaymentIntent(amount: number, bookingId: string) {
  const amountPaise = amount * 100;

  if (provider === 'razorpay') {
    return {
      provider: 'razorpay',
      orderId: `order_${bookingId}`,
      amount: amountPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      notes: { bookingId }
    };
  }

  return {
    provider: 'mock',
    orderId: `mock_${bookingId}`,
    amount: amountPaise,
    currency: 'INR',
    notes: { bookingId }
  };
}

export function verifyRazorpayPaymentSignature(payload: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
  const expected = crypto.createHmac('sha256', secret).update(`${payload.orderId}|${payload.paymentId}`).digest('hex');
  return expected === payload.signature;
}

export function signWebhookPayload(payload: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyWebhookSignature(payload: string, signature?: string | null) {
  if (!signature) return false;
  return signWebhookPayload(payload) === signature;
}
