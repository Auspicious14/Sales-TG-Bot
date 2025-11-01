jest.mock('mixpanel', () => ({
  init: jest.fn(),
  track: jest.fn(),
}));

import bot from '../src/controllers/bot.controller';

describe('Bot', () => {
  it('should be an instance of Telegraf', () => {
    expect(bot).toBeInstanceOf(Object);
  });
});
