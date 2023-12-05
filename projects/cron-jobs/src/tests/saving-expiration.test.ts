import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { SavingSchema } from '@knightprogrammers/scpio-db-schemas';

import { savingExpirationJob } from '../jobs/saving-expiration.job';

dotenv.config();

let dbConnection: any;

let SavingModel: any;

const createSaving = async (status: string, targetDate: Date) => {
  return SavingModel.create({
    name: 'Random Saving',
    status,
    targetAmount: 1312,
    targetDate,
    description: 'This is a description',
    currencyId: new mongoose.Types.ObjectId('4eb6e7e7e9b7f4194e000001'),
    bankAccountId: new mongoose.Types.ObjectId('4eb6e7e7e9b7f4194e000001'),
    userId: new mongoose.Types.ObjectId('4eb6e7e7e9b7f4194e000001'),
  });
};

const savings: any[] = [];

describe('SavingExpiration Job', () => {
  beforeAll(async () => {
    // Start Mongo DB collection
    dbConnection = await mongoose.connect(process.env.MONGO_DB_URI || '');
    SavingModel = mongoose.model('Saving', SavingSchema);
    // Reset Database
    await SavingModel.deleteMany();
    // 1 Saving status="IN_PROGRESS"
    const saving1: any = await createSaving(
      'IN_PROGRESS',
      DateTime.now().plus({ month: 8 }).toJSDate()
    );
    savings.push(saving1);
    // 1 Saving status="Expired"
    const saving2: any = await createSaving(
      'EXPIRED',
      DateTime.now().minus({ month: 8 }).toJSDate()
    );
    savings.push(saving2);
    // 1 Saving status="IN_PROGRESS" but with an
    const saving3: any = await createSaving(
      'IN_PROGRESS',
      DateTime.now().minus({ month: 8 }).toJSDate()
    );
    savings.push(saving3);
    await dbConnection.disconnect();
  });
  test('Set status `EXPIRED` when the targetDate is older than today', async () => {
    await savingExpirationJob();
    dbConnection = await mongoose.connect(process.env.MONGO_DB_URI || '');
    SavingModel = mongoose.model('Saving', SavingSchema);
    const saving1Updated: any = await SavingModel.findOne({
      _id: savings[0]._id,
    });
    expect(saving1Updated.status).toEqual('IN_PROGRESS');
    const saving2Updated: any = await SavingModel.findOne({
      _id: savings[1]._id,
    });
    expect(saving2Updated.status).toEqual('EXPIRED');
    const saving3Updated: any = await SavingModel.findOne({
      _id: savings[2]._id,
    });
    expect(saving3Updated.status).toEqual('EXPIRED');
  });
  afterAll(async () => {
    try {
      // Reset Database
      await mongoose.connection.dropDatabase();
    } catch (e: any) {
      console.log(e);
    }
  });
});
