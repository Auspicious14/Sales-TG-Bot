import axios from 'axios';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { trackEvent } from '../utils/analytics';

// Prices (in USD)
const PRICES: Record<string, number> = {
  monthly: 20,
  lifetime: 100
};

// Create Paystack transaction initialization for card payment
async function createPaystackTransaction(userId: number, type: string): Promise<string> {
  try {
    // Paystack primarily supports NGN, convert USD to NGN (approximate rate)
    const currency = process.env.PAYMENT_CURRENCY || 'NGN';
    let amount = PRICES[type] * 100; // Convert to kobo/cents
    
    // If using NGN, convert from USD (1 USD ≈ 1,600 NGN as of 2024)
    if (currency === 'NGN') {
      amount = PRICES[type] * 1550 * 100; // USD to NGN, then to kobo
    }

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: 'uthmanabdulganiyu2019@gmail.com',
        amount: Math.round(amount), // Must be integer
        currency: currency,
        callback_url: `${process.env.VERCEL_URL}/api/payment-success?userId=${userId}&type=${type}`,
        metadata: {
          userId,
          type,
          timestamp: Date.now()
        },
        reference: `${userId}-${type}-${Date.now()}`, // Unique reference
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Paystack response:', response.data);
    trackEvent('Paystack Transaction Initialized', { userId, type });
    
    return response.data.data.authorization_url;
  } catch (err: any) {
    console.error('Paystack error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw new Error(err.response?.data?.message || 'Failed to create card payment. Please try again.');
  }
}

// Handle Paystack webhook
async function handlePaystackWebhook(req: any): Promise<any> {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    throw new Error('Invalid webhook signature');
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const { userId, type } = event.data.metadata;
    await completeSubscription(Number(userId), type);
    trackEvent('Subscription Completed', { userId, type, method: 'card' });
  }
  return event;
}

// Create USDT payment via NowPayments
async function createUSDTPayment(userId: number, type: string): Promise<{ address: string; amount: number; invoiceUrl: string; paymentId: string }> {
  try {
    const response = await axios.post('https://api.nowpayments.io/v1/invoice', {
      price_amount: PRICES[type],
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      ipn_callback_url: `${process.env.VERCEL_URL}/api/usdt-webhook`,
      order_id: `${userId}-${type}`,
      order_description: 'Crypto Class Subscription',
    }, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
    });
    trackEvent('USDT Invoice Created', { userId, type });
    return {
      address: response.data.pay_address,
      amount: response.data.pay_amount,
      invoiceUrl: response.data.invoice_url,
      paymentId: response.data.payment_id,
    };
  } catch (err) {
    console.error('NowPayments error:', err);
    throw err;
  }
}

// Handle USDT webhook
async function handleUSDTWebhook(req: any): Promise<any> {
  const hmac = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET as string);
  hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
  const signature = hmac.digest('hex');

  if (signature !== req.headers['x-nowpayments-sig']) {
    throw new Error('Invalid IPN signature');
  }

  if (req.body.payment_status === 'finished') {
    const [userId, type] = req.body.order_id.split('-');
    await completeSubscription(Number(userId), type);
    trackEvent('Subscription Completed', { userId, type, method: 'usdt' });
  }
  return req.body;
}

// Complete subscription logic
async function completeSubscription(userId: number, type: string): Promise<void> {
  const user = await User.findOne({ userId });
  if (!user) throw new Error('User not found');

  user.subscribed = true;
  user.subscriptionType = type as 'monthly' | 'lifetime';
  if (type === 'monthly') {
    user.subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  await user.save();
}

export {
  createPaystackTransaction,
  handlePaystackWebhook,
  createUSDTPayment,
  handleUSDTWebhook,
};
