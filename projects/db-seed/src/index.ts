import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './helpers/logger';
import countrySeed from './seeds/country';
import currencySeed from './seeds/currency';

dotenv.config();

const config = {
	db: {
		uri: process.env.MONGO_DB_URI || '',
	},
}

;(async function main() {
	logger.info('Connecting to DB');
	logger.info(config.db.uri);
	const dbConnection = await mongoose.connect(config.db.uri);
	logger.info('DB connection is up');
	logger.info('-----------------');
	logger.info('Starting seeding:');
	await countrySeed();
	await currencySeed();
	logger.info('-----------------');
	await dbConnection.disconnect();
	logger.info('Done!');
})();
