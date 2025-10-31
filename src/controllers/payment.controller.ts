import { Request, Response } from 'express';
import { handlePaystackWebhook, handleUSDTWebhook } from '../services/payment.service';

export const paystackWebhook = async (req: Request, res: Response) => {
  try {
    await handlePaystackWebhook(req);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(400);
  }
};

export const usdtWebhook = async (req: Request, res: Response) => {
  try {
    await handleUSDTWebhook(req);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(400);
  }
};
