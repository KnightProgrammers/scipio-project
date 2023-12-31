import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { CreditCardSchema } from '@knightprogrammers/scpio-db-schemas';
import getLogger from '../helpers/logger';

dotenv.config();

let connection: mongoose.Connection;

export const creditCardExpirationJob = async (
	limit = 100
): Promise<void> => {
	const logger = getLogger('[CreditCardExpiration] ');
	connection = mongoose.createConnection(process.env.MONGO_DB_URI || '');
	const CreditCardModel = connection.model('CreditCard', CreditCardSchema);
	try {
		logger.info('Starting job');
		const creditCards: any[] = await CreditCardModel.find({
			status: 'ACTIVE',
			expiration: {
				$lte: DateTime.now().toJSDate(),
			},
		}).limit(limit);
		for (const creditCard of creditCards) {
			creditCard.status = 'EXPIRED';
			await creditCard.save();
		}
		logger.info(
			`${creditCards.length} credit card${
				creditCards.length > 1 ? 's' : ''
			} expired`
		);
	} catch (e: any) {
		logger.debug(e);
		logger.error('Error expiring credit cards');
	} finally {
		await connection.close();
	}
};
