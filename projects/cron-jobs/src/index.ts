import * as cron from 'node-cron';
import { creditCardExpirationJob } from './jobs/credit-card-expiration.job';
 
cron.schedule(`*/1 * * * *`, async () => {
  await creditCardExpirationJob();
});