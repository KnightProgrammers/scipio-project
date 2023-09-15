import mongoose from "mongoose";
import logger from "../helpers/logger";

import { CountrySchema } from "../../../server/src/models/country.model";
import countryList from '../fixtures/countries.json';

export default async () => {
  const CountryModel = mongoose.model('Country', CountrySchema);
  logger.info(' • Seeding Countries');
  for (const country of countryList) {
    try {
      const exist = await CountryModel.findOne({name: country});
      if (exist) {
        logger.debug(`\t "${country}" already exists`);
      } else {
        await CountryModel.create({name: country});
        logger.info(`\t "${country}" added`);
      }
    } catch (e) {
      console.error(e)
    }
  }
}
