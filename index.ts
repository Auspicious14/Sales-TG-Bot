import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/utils/db';
import bot from './src/controllers/bot.controller';
import routes from './src/routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.raw({ type: 'application/json' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});
app.use(limiter);

connectDB();

app.use('/webhook', bot.webhookCallback('/'));
app.use('/api', routes);

app.get('/', (req: Request, res: Response) => res.send('Bot is running!'));

bot.telegram.setWebhook(`${process.env.VERCEL_URL}/webhook`)
  .then(() => console.log('Webhook set'))
  .catch((err: any) => console.error('Webhook error:', err));

/*app.listen(port, () => {
  console.log(`Server on port ${port}`);
});*/

export default app;
