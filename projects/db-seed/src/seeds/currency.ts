import mongoose from 'mongoose';
import logger from '../helpers/logger';

import { CurrencySchema } from '@knightprogrammers/scpio-db-schemas';
import currencyList from '../fixtures/currencies.json';

export default async () => {
	const CurrencyModel = mongoose.model('Currency', CurrencySchema);
	logger.info(' • Seeding Currencies');
	for (const { name, code } of currencyList) {
		try {
			const exist = await CurrencyModel.findOne({ code });
			if (exist) {
				logger.debug(`\t "${code}" already exists`);
			} else {
				await CurrencyModel.create({ name, code });
				logger.info(`\t "${code}" added`);
			}
		} catch (e) {
			console.error(e);
		}
	}
};
