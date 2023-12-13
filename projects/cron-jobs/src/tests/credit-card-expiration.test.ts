import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { CreditCardSchema } from '@knightprogrammers/scpio-db-schemas';

import { creditCardExpirationJob } from '../jobs/credit-card-expiration.job';

dotenv.config();

let dbConnection: mongoose.Connection;

let CreditCardModel: any;

const createCreditCard = async (status: string, expirationDate: Date) => {
	return CreditCardModel.create({
		label: 'Credit Card',
		cardHolder: 'Demo Account',
		lastFourDigits: 1234,
		expiration: expirationDate,
		issuer: 'visa',
		status,
		creditLimitAmount: 13121991,
		creditLimitCurrency: {
			_id: new mongoose.Types.ObjectId('4eb6e7e7e9b7f4194e000001'),
			code: 'USD',
			name: 'USD Dollar',
		},
		userId: new mongoose.Types.ObjectId('4eb6e7e7e9b7f4194e000001'),
	});
};

const creditCards: any[] = [];

describe('CreditCardExpiration Job', () => {
	beforeAll(async () => {
		// Start Mongo DB collection
		dbConnection = mongoose.createConnection(process.env.MONGO_DB_URI || '');
		CreditCardModel = dbConnection.model('CreditCard', CreditCardSchema);
		// Reset Database
		await CreditCardModel.deleteMany();
		// 1 Credit Card status="Active"
		const creditCard1: any = await createCreditCard(
			'ACTIVE',
			DateTime.now().plus({ month: 8 }).toJSDate()
		);
		creditCards.push(creditCard1);
		// 1 Credit Card status="Expired"
		const creditCard2: any = await createCreditCard(
			'EXPIRED',
			DateTime.now().minus({ month: 8 }).toJSDate()
		);
		creditCards.push(creditCard2);
		// 1 Credit Card status="Active" but with an
		const creditCard3: any = await createCreditCard(
			'ACTIVE',
			DateTime.now().minus({ month: 8 }).toJSDate()
		);
		creditCards.push(creditCard3);
		await dbConnection.close();
	});
	test('Set status `EXPIRED` when the expiration is older than today', async () => {
		await creditCardExpirationJob();
		dbConnection = mongoose.createConnection(process.env.MONGO_DB_URI || '');
		CreditCardModel = dbConnection.model('CreditCard', CreditCardSchema);
		const creditCard1Updated: any = await CreditCardModel.findOne({
			_id: creditCards[0]._id,
		});
		expect(creditCard1Updated.status).toEqual('ACTIVE');
		const creditCard2Updated: any = await CreditCardModel.findOne({
			_id: creditCards[1]._id,
		});
		expect(creditCard2Updated.status).toEqual('EXPIRED');
		const creditCard3Updated: any = await CreditCardModel.findOne({
			_id: creditCards[2]._id,
		});
		expect(creditCard3Updated.status).toEqual('EXPIRED');
	});
	afterAll(async () => {
		try {
			// Reset Database
			await dbConnection.dropDatabase();
			await dbConnection.close();
		} catch (e: any) {
			console.log(e);
		}
	});
});
