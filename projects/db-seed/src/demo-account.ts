import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './helpers/logger';
import { DateTime } from 'luxon';

import {
	BankAccountSchema,
	BankSchema,
	BudgetCategorySchema,
	BudgetSchema,
	CategorySchema,
	CountrySchema,
	CreditCardMonthlyStatementSchema,
	CreditCardStatementPaymentSchema,
	CreditCardSchema,
	CurrencySchema,
	ExpenseSchema,
	IncomeSchema,
	SavingSchema,
	UserSchema
} from '@knightprogrammers/scpio-db-schemas';

dotenv.config();

const config = {
	db: {
		uri: process.env.MONGO_DB_URI || '',
	},
	firebaseId: process.env.USER_FIREBASE_ID || ''
};

const CURRENCY_CODES = ['USD', 'UYU'];

function randomFloatInRange (min: number = 0, max: number = 1) {
	return Math.random() * (max - min) + min;
}

;(async function main() {
	logger.info('Connecting to DB');
	logger.info(config.db.uri);

	const dbConnection = await mongoose.connect(config.db.uri);
	const BankModel = mongoose.model('Bank', BankSchema);
	const BankAccountModel = mongoose.model('BankAccount', BankAccountSchema);
	const BudgetModel = mongoose.model('Budget', BudgetSchema);
	const BudgetCategoryModel = mongoose.model('BudgetCategory', BudgetCategorySchema);
	const CategoryModel = mongoose.model('Category', CategorySchema);
	const CountryModel = mongoose.model('Country', CountrySchema);
	const CreditCardModel = mongoose.model('CreditCard', CreditCardSchema);
	const CreditCardMonthlyStatementModel = mongoose.model('CreditCardMonthlyStatement', CreditCardMonthlyStatementSchema);
	const CreditCardStatementPaymentModel = mongoose.model('CreditCardStatementPayment', CreditCardStatementPaymentSchema);
	const CurrencyModel = mongoose.model('Currency', CurrencySchema);
	const ExpenseModel = mongoose.model('Expense', ExpenseSchema);
	const IncomeModel = mongoose.model('Income', IncomeSchema);
	const SavingModel = mongoose.model('Saving', SavingSchema);
	const UserModel = mongoose.model('User', UserSchema);
	logger.info('DB connection is up');
	logger.info('-----------------');
	logger.info('Generating Demo account:');
	// Add Demo User
	const currencies = await CurrencyModel.find({code: CURRENCY_CODES});
	const country = await CountryModel.findOne({name: 'Uruguay'});

	if (!currencies.length) {
		throw new Error('There are no Currencies!');
	}

	const userExist = await UserModel.findOne({email: 'demo@scipiofinances.com'});

	if (userExist) {
		throw new Error('Demo account already created!');
	}

	const { _id: userId } = await UserModel.create({
		name: 'Demo Account',
		email: 'demo@scipiofinances.com',
		avatar: null,
		firebaseId: config.firebaseId,
		currencies,
		country,
		isTest: true,
		lang: 'en'
	});

	logger.info(`	User created with id: "${userId.toString()}"`);

	const categories: any[] = [
		{name: 'Groceries', type: 'NEED', isFixedPayment: false, expenses: 30, expenseRange: [100,2000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 26000},
		{name: 'Rent', type: 'NEED', isFixedPayment: false, expenses: 1, expenseRange: 20000, currencies: ['UYU'], method: 'CASH', budget: 20000},
		{name: 'Services', type: 'NEED', isFixedPayment: false, expenses: 4, expenseRange: [1200,1800], currencies: ['UYU'], method: 'CASH', budget: 5000},
		{name: 'Self Care', type: 'NEED', isFixedPayment: false, expenses: 3, expenseRange: [500, 1000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 1800},
		{name: 'Clothes', type: 'WANT', isFixedPayment: false, expenses: 2, expenseRange: [3000, 6000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 9000},
		{name: 'Home', type: 'NEED', isFixedPayment: false, expenses: 2, expenseRange: [500, 1000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 2000},
		{name: 'Transportation', type: 'WANT', isFixedPayment: false, expenses: 2, expenseRange: [2000, 3000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 8000},
		{name: 'Pet', type: 'WANT', isFixedPayment: false, expenses: 1, expenseRange: [3800, 5000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 50000},
		{name: 'Entertainment', type: 'WANT', isFixedPayment: false, expenses: -1, expenseRange: [800,6000], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 4000},
		{name: 'Health', type: 'NEED', isFixedPayment: false, expenses: 4, expenseRange: [600,2500], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 2000},
		{name: 'Gifts', type: 'WANT', isFixedPayment: false, expenses: -1, expenseRange: [500, 2200], currencies: ['UYU'], method: 'CREDIT_CARD', budget: 2000},
		{name: 'Gym', type: 'WANT', isFixedPayment: false, expenses: 1, expenseRange: 2500, currencies: ['UYU'], method: 'CREDIT_CARD', budget: 2500},
		{name: 'Travel', type: 'SAVE', isFixedPayment: false, expenses: 1, expenseRange: [100,300], currencies: ['USD'], method: 'CASH', budget: 300},
		{name: 'Technology', type: 'WANT', isFixedPayment: false, expenses: 2, expenseRange: [100, 500], currencies: ['USD'], method: 'CREDIT_CARD', budget: 1000},
		{name: 'Subscriptions', type: 'NEED', isFixedPayment: false, expenses: 10, expenseRange: [8, 15], currencies: ['USD'], method: 'CREDIT_CARD', budget: 150},
	];

	for (const category of categories) {
		const newCategory = await CategoryModel.create({
			name: category.name,
			type: category.type,
			isFixedPayment: category.isFixedPayment,
			userId
		});
		category.id = newCategory._id;
	}

	logger.info(`	Added ${categories.length} categories`);

	const budget = await BudgetModel.create({userId});

	for (const category of categories) {
		await BudgetCategoryModel.create({
			budgetId: budget._id,
			categoryId: category.id,
			currencies: currencies.map((c: any) => ({
				limit: category.currencies.includes(c.code) ? category.budget : 0,
				currency: c
			}))
		});
	}

	logger.info(`	Added ${categories.length} budgets`);



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

	const creditCard1: any = await CreditCardModel.create({
		label: 'Platinum',
		cardHolder: 'Demo Account',
		lastFourDigits: parseInt((new Date()).getMilliseconds().toPrecision(4).toString().replace('.', '')), // Random
		expiration: DateTime.now().plus({years: 3, month: 3}).toJSDate(),
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
		expiration: DateTime.now().plus({years: 1, month: 5}).toJSDate(),
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
		expiration: DateTime.now().minus({month: 8}).toJSDate(),
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
		expiration: DateTime.now().plus({years: 3, month: 3}).toJSDate(),
		issuer: 'visa',
		status: 'BLOCKED',
		creditLimitAmount: (new Date()).getMilliseconds() * 100,
		creditLimitCurrency: currencies[0],
		userId
	});

	logger.info('	Added 4 credit cards');

	// Expenses

	let creditCardExpenseCounter: number = 0;

	let billableDate = DateTime.now().set({
		day: 1,
		hour: 0,
		minute: 0,
		millisecond: 0
	});

	for (let monthDiff = 0; monthDiff < 12; monthDiff++) {

		let monthlyStatement = undefined;

		const creditCardTotalExpense: any = {
			'USD': 0,
			'UYU': 0
		};

		if (monthDiff > 0) {
			monthlyStatement = await CreditCardMonthlyStatementModel.create({
				closeDate: billableDate.set({
					day: 28
				}),
				creditCardId: creditCard1._id,
				userId
			});
		}
		for (const category of categories) {
			const {
				expenseRange,
				method
			} = category;

			const creditCardId = method === 'CREDIT_CARD' ? creditCard1._id : undefined;
			const creditCardMonthlyStatementId = method === 'CREDIT_CARD' && monthlyStatement ? monthlyStatement._id : undefined;

			const currencyCode: string = category.currencies[0]  ?? 'UYU';


			const max: number = 28;
			const increment: number = category.expenses < 0 ? Math.random() * (10 - 1) + 1 : Math.max(Math.round(max / category.expenses), 1);

			let i: number = 1;

			while(i <= max) {
				creditCardExpenseCounter += 1;
				const amount: number = Array.isArray(expenseRange) ? randomFloatInRange(expenseRange[0], expenseRange[1]) : expenseRange;
				creditCardTotalExpense[currencyCode] += amount;
				await ExpenseModel.create({
					amount,
					description: '',
					billableDate: billableDate.toJSDate(),
					type: method,
					currencyId: currencies.find((c: any) => c.code === currencyCode )?._id ?? undefined,
					categoryId: category.id,
					creditCardId,
					creditCardMonthlyStatementId,
					userId
				});
				i += increment;
				if (i > 28) {
					break;
				}
				billableDate = billableDate.plus({day: increment});
			}
			billableDate = billableDate.set({day: 1});
		}
		if (monthlyStatement) {
			await CreditCardStatementPaymentModel.create({
				paymentDate: billableDate.set({
					day: 28
				}),
				creditCardMonthlyStatementId: monthlyStatement._id,
				userId,
				currencies: currencies.map((currency: any) => ({
					amount: creditCardTotalExpense[currency.code],
					currency,
					type: 'TOTAL'
				}))
			});
		}
		billableDate = billableDate.set({day: 1}).minus({month: 1});
	}

	logger.info(`	Added ${creditCardExpenseCounter} expenses`);

	// Incomes

	let incomeDate = DateTime.now().startOf('year').plus({day: 5});
	const bankAccount = bankAccounts[0];
	for (let i = 0; i < 12; i++) {
		await IncomeModel.create({
			amount: 4000,
			description: 'Salary',
			incomeDate: incomeDate.toISO({includeOffset: false}),
			currencyId: bankAccount.accountCurrency._id,
			bankAccountId: bankAccount._id,
			userId
		});
		incomeDate = incomeDate.plus({month: 1});
	}

	logger.info('	Added 14 incomes');

	logger.info('-----------------');
	await dbConnection.disconnect();
	logger.info('Done!');
})();
