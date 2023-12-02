import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './helpers/logger';
import { DateTime } from 'luxon';


import {
	BankAccountSchema,
	BankSchema,
	CategorySchema,
	CountrySchema, CreditCardSchema,
	CurrencySchema, SavingSchema,
	UserSchema
} from '@knightprogrammers/scpio-db-schemas';

dotenv.config();

const config = {
	db: {
		uri: process.env.MONGO_DB_URI || '',
	},
};

const CURRENCY_CODES = ['USD', 'UYU']

;(async function main() {
	logger.info('Connecting to DB');
	logger.info(config.db.uri);

	const dbConnection = await mongoose.connect(config.db.uri);
	const BankModel = mongoose.model('Bank', BankSchema);
	const BankAccountModel = mongoose.model('BankAccount', BankAccountSchema);
	const CategoryModel = mongoose.model('Category', CategorySchema);
	const CountryModel = mongoose.model('Country', CountrySchema);
	const CreditCardModel = mongoose.model('CreditCard', CreditCardSchema);
	const CurrencyModel = mongoose.model('Currency', CurrencySchema);
	const SavingModel = mongoose.model('Saving', SavingSchema);
	const UserModel = mongoose.model('User', UserSchema);
	logger.info('DB connection is up');
	logger.info('-----------------');
	logger.info('Generating Demo account:');
	// Add Demo User
	const currencies = await CurrencyModel.find({code: CURRENCY_CODES});
	const country = await CountryModel.findOne({name: 'Uruguay'});

	const userExist = await UserModel.findOne({email: 'demo@scipiofinances.com'});

	if (userExist) {
		// throw new Error('Demo account already created!');
		await userExist.deleteOne(); // TODO: Temporal remove before deploying it
	}

	const { _id: userId } = await UserModel.create({
		name: 'Demo Account',
		email: 'demo@scipiofinances.com',
		avatar: null,
		firebaseId: 'zfSV2tiQlBerX9fCAFz8MXM0NRi2',
		currencies,
		country,
		lang: 'en'
	});

	logger.info(`	User created with id: "${userId.toString()}"`);

	const categories: any[] = [
		{name: 'Groceries', type: 'NEED', isFixedPayment: false},
		{name: 'Rent', type: 'NEED', isFixedPayment: false},
		{name: 'Services', type: 'NEED', isFixedPayment: false},
		{name: 'Self Care', type: 'NEED', isFixedPayment: false},
		{name: 'Clothes', type: 'WANT', isFixedPayment: false},
		{name: 'Home', type: 'NEED', isFixedPayment: false},
		{name: 'Transportation', type: 'WANT', isFixedPayment: false},
		{name: 'Pet', type: 'WANT', isFixedPayment: false},
		{name: 'Entertainment', type: 'WANT', isFixedPayment: false},
		{name: 'Health', type: 'NEED', isFixedPayment: false},
		{name: 'Gifts', type: 'WANT', isFixedPayment: false},
		{name: 'Gym', type: 'WANT', isFixedPayment: false},
		{name: 'Travel', type: 'SAVE', isFixedPayment: false},
		{name: 'Technology', type: 'WANT', isFixedPayment: false},
		{name: 'Subscriptions', type: 'NEED', isFixedPayment: false},
	];

	for (const category of categories) {
		const newCategory = await CategoryModel.create({
			...category,
			userId
		});
		category.id = newCategory._id;
	}

	logger.info(`	Added ${categories.length} categories`);

	const banks: any[] = [
		{name: 'BROU', icon: ''},
		{name: 'Santander', icon: ''},
	];

	for (const bank of banks) {
		const newBank = await BankModel.create({
			...bank,
			user: userId
		});
		bank.id = newBank._id;
	}

	logger.info(`	Added ${banks.length} banks`);

	// Generate Bank Accounts

	const bankAccounts: any = [];

	for (const bank of banks) {
		for (const currency of currencies) {
			const newBankAccount = await BankAccountModel.create({
				accountNumber: parseInt((Math.random() * 1000000000).toFixed(0)),
				accountBalance: parseFloat((Math.random() * 100000).toFixed(2)),
				accountUserId: userId,
				accountBankId: bank.id,
				accountCurrency: currency
			});
			bankAccounts.push(newBankAccount);
		}
	}

	logger.info(`	Added ${bankAccounts.length} bank accounts`);

	// Savings
	/*
		- Active
		- Completed
		- Not Completed
		- Expired
	*/

	await SavingModel.create({
		name: 'Vacations Malaga',
		targetAmount: bankAccounts[0].accountBalance + parseFloat((Math.random() * 10000).toFixed(0)),
		targetDate: DateTime.now().plus({month: 9}).toJSDate(),
		status: 'IN_PROGRESS',
		bankAccountId: bankAccounts[0]._id,
		currencyId: bankAccounts[0].accountCurrency._id,
		userId
	});
	await SavingModel.create({
		name: 'Vacations Bariloche',
		targetAmount: parseFloat((Math.random() * 10000).toFixed(0)),
		targetDate: DateTime.now().minus({month: 5}).toJSDate(),
		status: 'COMPLETED',
		bankAccountId: bankAccounts[0]._id,
		currencyId: bankAccounts[0].accountCurrency._id,
		userId
	});
	await SavingModel.create({
		name: 'Apartment',
		targetAmount: bankAccounts[2].accountBalance + parseFloat((Math.random() * 1000000).toFixed(0)),
		targetDate: DateTime.now().minus({month: 8}).toJSDate(),
		status: 'NOT_CONCLUDED',
		bankAccountId: bankAccounts[2]._id,
		currencyId: bankAccounts[2].accountCurrency._id,
		userId
	});
	await SavingModel.create({
		name: 'New Tv',
		targetAmount: parseFloat((Math.random() * 1000000).toFixed(0)),
		targetDate: DateTime.now().minus({years: 2}).toJSDate(),
		status: 'IN_PROGRESS',
		bankAccountId: bankAccounts[1]._id,
		currencyId: bankAccounts[1].accountCurrency._id,
		userId
	});

	logger.info('	Added 4 savings');

	// Credit Cards
	/*
		- Active x 2
		- Expired
		- Blocked
	*/

	// const creditCard1: any =
	await CreditCardModel.create({
		label: 'Platinum',
		cardHolder: 'Demo Account',
		lastFourDigits: parseInt((new Date()).getMilliseconds().toPrecision(4).toString().replace('.', '')), // Random
		expiration: DateTime.now().plus({years: 3, month: 3}).toFormat('MMyy'),
		issuer: 'mastercard',
		status: 'ACTIVE',
		creditLimitAmount: (new Date()).getMilliseconds() * 10,
		creditLimitCurrency: currencies[0],
		userId
	});

	// const creditCard2: any =
	await CreditCardModel.create({
		label: 'Gold',
		cardHolder: 'Demo Account',
		lastFourDigits: parseInt((new Date()).getMilliseconds().toPrecision(4).toString().replace('.', '')), // Random
		expiration: DateTime.now().plus({years: 1, month: 5}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'ACTIVE',
		creditLimitAmount: (new Date()).getMilliseconds() * 10,
		creditLimitCurrency: currencies[0],
		userId
	});

	await CreditCardModel.create({
		label: 'Platinum',
		cardHolder: 'Demo Account',
		lastFourDigits: parseInt((new Date()).getMilliseconds().toPrecision(4).toString().replace('.', '')), // Random
		expiration: DateTime.now().minus({month: 8}).toFormat('MMyy'),
		issuer: 'mastercard',
		status: 'EXPIRED',
		creditLimitAmount: (new Date()).getMilliseconds() * 10,
		creditLimitCurrency: currencies[0],
		userId
	});

	await CreditCardModel.create({
		label: 'Stolen',
		cardHolder: 'Demo Account',
		lastFourDigits: parseInt((new Date()).getMilliseconds().toPrecision(4).toString().replace('.', '')), // Random
		expiration: DateTime.now().plus({years: 3, month: 3}).toFormat('MMyy'),
		issuer: 'visa',
		status: 'BLOCKED',
		creditLimitAmount: (new Date()).getMilliseconds() * 100,
		creditLimitCurrency: currencies[0],
		userId
	});

	logger.info('	Added 4 credit cards');

	// Expenses

	// Cash Expenses

	// Credit Card Expenses

	// Budgets

	logger.info('-----------------');
	await dbConnection.disconnect();
	logger.info('Done!');
})();
