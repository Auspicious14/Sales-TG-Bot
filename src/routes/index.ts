import { Router } from 'express';
import { paystackWebhook, usdtWebhook } from '../controllers/payment.controller';

const router = Router();

router.post('/paystack-webhook', paystackWebhook);
router.post('/usdt-webhook', usdtWebhook);

export default router;
