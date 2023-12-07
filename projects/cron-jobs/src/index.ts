import * as cron from 'node-cron';
import { creditCardExpirationJob } from './jobs/credit-card-expiration.job';
import { savingExpirationJob } from './jobs/saving-expiration.job';

// Website to create cron expressions
// https://crontab.cronhub.io/

const EVERY_DAY_AT_MIDNIGHT_CRON: string = '0 0 * * *';

// Every Day at 00:00AM
cron.schedule(EVERY_DAY_AT_MIDNIGHT_CRON, async () => {
  await creditCardExpirationJob();
});

// Every Day at 00:00AM
cron.schedule(EVERY_DAY_AT_MIDNIGHT_CRON, async () => {
  await savingExpirationJob();
});
