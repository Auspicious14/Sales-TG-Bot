import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/utils/db';
import bot from './src/controllers/bot.controller';
import routes from './src/routes';

const app = express();

app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});
app.use(limiter);

connectDB();

// Set the bot webhook
bot.telegram.setWebhook(`${process.env.VERCEL_URL}/webhook`)
  .then(() => console.log('Webhook set successfully.'))
  .catch((err: any) => console.error('Failed to set webhook:', err));

// Register handlers
app.use('/webhook', bot.webhookCallback('/'));
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => res.send('Bot is running!'));

export default app;
