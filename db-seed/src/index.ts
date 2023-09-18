import mongoose from "mongoose";

import logger from "./helpers/logger";
import countrySeed from "./seeds/country";


const config = {
  db: {
    protocol: process.env.MONGO_DB_PROTOCOL,
    host: process.env.MONGO_DB_HOST,
    port: process.env.MONGO_DB_PORT,
    name: process.env.MONGO_DB_NAME,
    params: process.env.MONGO_DB_PARAMS,
    user: process.env.MONGO_DB_USER,
    password: process.env.MONGO_DB_PASSWORD,
  }
};

(async function main() {
  logger.info("Connecting to DB")
  logger.debug(`  ${config.db.protocol}://${config.db.host}${config.db.port ? `:${config.db.port}` : ''}/${!!config.db.name && config.db.name}${!!config.db.params ? `?${config.db.params}` : ''}`)

  const dbConnection = await mongoose.connect(
    `${config.db.protocol}://${config.db.host}${config.db.port ? `:${config.db.port}` : ''}/${!!config.db.name && config.db.name}${!!config.db.params ? `?${config.db.params}` : ''}`,
    {
      user: config.db.user,
      pass: config.db.password,
      bufferCommands: false,
      autoCreate: true
    }
  );
  logger.info('DB connection is up');
  logger.info('-----------------');
  logger.info('Starting seeding:');
  await countrySeed();
  logger.info('-----------------');
  await dbConnection.disconnect();
  logger.info('Done!')
})();
