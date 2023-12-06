import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { SavingSchema } from '@knightprogrammers/scpio-db-schemas';
import getLogger from '../helpers/logger';

dotenv.config();

export const savingExpirationJob = async (
  limit: number = 100
): Promise<void> => {
  const logger = getLogger('[SavingExpiration] ');
  await mongoose.connect(process.env.MONGO_DB_URI || '');
  const SavingModel = mongoose.model('Saving', SavingSchema);
  try {
    logger.info('Starting job');
    const savings: any[] = await SavingModel.find({
      status: 'IN_PROGRESS',
      targetDate: {
        $lte: DateTime.now().toJSDate(),
      },
    }).limit(limit);
    for (const saving of savings) {
      saving.status = 'EXPIRED';
      await saving.save();
    }
    logger.info(
      `${savings.length} saving${savings.length > 1 ? 's' : ''} expired`
    );
  } catch (e: any) {
    logger.debug(e);
    logger.error('Error expiring savings');
  } finally {
    await mongoose.connection.close();
  }
};
