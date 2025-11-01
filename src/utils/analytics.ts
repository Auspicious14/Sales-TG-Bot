import Mixpanel from 'mixpanel';
import * as dotenv from 'dotenv';

dotenv.config();

const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN as string);

const trackEvent = (eventName: string, properties: Record<string, any> = {}): void => {
  try {
    mixpanel.track(eventName, properties);
  } catch (err) {
    console.error('Analytics error:', err);
  }
};

export { trackEvent };
