import { Telegraf, Markup, Context } from 'telegraf';
import { User } from '../models/user.model';
import { trackEvent } from '../utils/analytics';
import { createPaystackTransaction, createUSDTPayment } from '../services/payment.service';
import { Update } from 'telegraf/typings/core/types/typegram';

// Define a custom context interface that includes the 'match' property
interface CustomContext extends Context<Update> {
  match?: RegExpExecArray;
}

const PRICES: Record<string, number> = {
  monthly: 20,
  lifetime: 100
};

const bot = new Telegraf(process.env.TELEGRAM_TOKEN as string);

// Main keyboard
const mainKeyboard = Markup.keyboard([
  ['Menu', 'Support'],
  ['Enquiry', 'Subscription'],
  ['FAQ']
]).resize();

// Start command
bot.start(async (ctx: Context) => {
  const userId = ctx.from?.id as number;
  let user = await User.findOne({ userId });
  if (!user) {
    user = new User({ userId });
    await user.save();
  }
  trackEvent('User Started', { userId });
  ctx.reply('Welcome to the Crypto Class Sales Bot! Learn about crypto trading.', mainKeyboard);
});

// Menu
bot.hears('Menu', (ctx: Context) => {
  ctx.reply("Here's the menu:\n- Beginner Trading\n- Advanced Strategies\nChoose Subscription to join!");
});

// Support
bot.hears('Support', (ctx: Context) => {
  ctx.reply('Contact @Auspicious14 or uthmanabdulganiyu2019@gmail.com.');
});

// Enquiry (conversational)
bot.hears('Enquiry', (ctx: Context) => {
  ctx.reply("What's your enquiry? Type your question.");
});


// FAQ
bot.hears('FAQ', (ctx: Context) => {
  ctx.reply('FAQs:\n1. What is the class about? Crypto trading basics.\n2. Refund policy? No refunds.\n3. How to pay? Card or USDT.');
});

// Subscription flow
bot.hears('Subscription', async (ctx: Context) => {
  const userId = ctx.from?.id as number;
  const user = await User.findOne({ userId });
  if (user?.subscribed) {
    return sendInviteLink(ctx, userId);
  }

  ctx.reply('Choose subscription type:', Markup.inlineKeyboard([
      Markup.button.callback('Monthly ($20/mo)', 'sub_monthly'),
      Markup.button.callback('Lifetime ($100)', 'sub_lifetime')
    ])
  );
});

bot.on('text', async (ctx: Context) => {
    if (ctx.message && 'text' in ctx.message) {
        const text = ctx.message.text;
        if (!['Menu', 'Support', 'Enquiry', 'Subscription', 'FAQ'].includes(text)) {
            trackEvent('Enquiry Received', { userId: ctx.from?.id, query: text });
            ctx.reply(`Thanks for: "${text}". We'll review and DM you.`);
        }
    }
});

bot.action(/sub_(monthly|lifetime)/, async (ctx: CustomContext) => {
  try {
    const type = ctx.match?.[1] as string;
    trackEvent('Subscription Type Selected', { userId: ctx.from?.id, type });

    await ctx.answerCbQuery();
    
    await ctx.reply(
      `You selected: ${type === 'monthly' ? 'Monthly' : 'Lifetime'} subscription\n` +
      `Price: $${PRICES[type]}\n\n` +
      `Choose your payment method:`,
      Markup.inlineKeyboard([
        [Markup.button.callback('💳 Card Payment', `pay_card_${type}`)],
        [Markup.button.callback('🪙 USDT (Crypto)', `pay_usdt_${type}`)]
      ])
    );
  } catch (error) {
    console.error('Subscription selection error:', error);
    await ctx.reply('An error occurred. Please try again.');
  }
});

bot.action(/pay_card_(monthly|lifetime)/, async (ctx: CustomContext) => {
  const type = ctx.match?.[1] as string;
  const url = await createPaystackTransaction(ctx.from?.id as number, type);
  ctx.reply(`Complete card payment: ${url}`);
  await ctx.answerCbQuery();
});

bot.action(/pay_usdt_(monthly|lifetime)/, async (ctx: CustomContext) => {
  try {
    const type = ctx.match?.[1] as string;
    await ctx.answerCbQuery('Creating payment...');
    
    const { invoiceUrl } = await createUSDTPayment(ctx.from?.id as number, type);
    
    await ctx.reply(
      `💳 Complete your USDT payment:\n\n` +
      `Amount: $${PRICES[type]}\n` +
      `Payment Link: ${invoiceUrl}\n\n` +
      `✅ You'll be notified automatically once payment is confirmed.`,
      Markup.inlineKeyboard([
        Markup.button.url('Pay Now', invoiceUrl)
      ])
    );
  } catch (error: any) {
    console.error('USDT payment error:', error);
    await ctx.reply('❌ An error occurred creating your payment. Please try again or contact support.');
  }
});

// Function to send invite link or add to group
async function sendInviteLink(ctx: Context, userId: number): Promise<void> {
  try {
    const invite = await bot.telegram.createChatInviteLink(Number(process.env.PREMIUM_GROUP_ID), {
      member_limit: 1,
      creates_join_request: false,
    });
    ctx.reply(`Subscription active! Join premium group: ${invite.invite_link}`);
    trackEvent('Invite Sent', { userId });
  } catch (err) {
    console.error('Invite error:', err);
    ctx.reply('Error generating invite. Contact support.');
  }
}

// Error handling for bot
bot.catch((err: any, ctx: Context) => {
  console.error('Bot error:', err);
  ctx.reply('An error occurred. Try again or contact support.');
  trackEvent('Bot Error', { error: err.message });
});

export default bot;
