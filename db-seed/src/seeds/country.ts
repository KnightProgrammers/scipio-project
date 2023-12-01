import mongoose from "mongoose";
import logger from '../helpers/logger';

import { CountrySchema } from "@scipio/models";
import countryList from '../fixtures/countries.json';

export default async () => {
	const CountryModel = mongoose.model('Country', CountrySchema);
	logger.info(' • Seeding Countries');
	for (const { name, code, isSupported = false } of countryList) {
		try {
			const exist = await CountryModel.findOne({ name });
			if (exist) {
				logger.debug(`\t "${name}" already exists`);
			} else {
				await CountryModel.create({ name, code, isSupported });
				logger.info(`\t "${name}" added`);
			}
		} catch (e) {
			console.error(e);
		}
	}
};
