import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './helpers/logger';
import {
	BankAccountSchema,
	BankSchema,
	BudgetCategorySchema,
	BudgetSchema,
	CategorySchema,
	CreditCardMonthlyStatementSchema,
	CreditCardSchema,
	ExpenseSchema,
	IncomeSchema, SavingSchema, UserSchema
} from '@knightprogrammers/scpio-db-schemas';

dotenv.config();

const config = {
	db: {
		uri: process.env.MONGO_DB_URI || '',
	},
	whitelist: {
		firebaseIds: process.env.WHITELIST_FIREBASE_IDS?.split(',') ?? [],
	}
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
	const CreditCardModel = mongoose.model('CreditCard', CreditCardSchema);
	const CreditCardMonthlyStatementModel = mongoose.model('CreditCardMonthlyStatement', CreditCardMonthlyStatementSchema);
	const ExpenseModel = mongoose.model('Expense', ExpenseSchema);
	const IncomeModel = mongoose.model('Income', IncomeSchema);
	const SavingModel = mongoose.model('Saving', SavingSchema);
	const UserModel = mongoose.model('User', UserSchema);
	logger.info('DB connection is up');
	// Find test users that are not in the whitelist
	const allowedFirebaseIds: string[] = config.whitelist.firebaseIds.filter((e: string) => e.length);
	const testUsers = await UserModel.find({isTest: true, firebaseId: {'$nin': allowedFirebaseIds}});
	// For Each user remove related data
	for (const testUser of testUsers) {
		const userId = testUser._id;
		logger.info(`	User: ${testUser.email}`);
		await ExpenseModel.deleteMany({userId});
		await IncomeModel.deleteMany({userId});
		await SavingModel.deleteMany({userId});
		await  CreditCardMonthlyStatementModel.deleteMany({userId});
		const budgets = await BudgetModel.find({userId});
		for (const budget of budgets) {
			await BudgetCategoryModel.deleteMany({budgetId: budget._id});
			await budget.deleteOne();
		}
		await CategoryModel.deleteMany({userId});
		await CreditCardModel.deleteMany({userId});
		await BankAccountModel.deleteMany({accountUserId: userId});
		await BankModel.deleteMany({user: userId});
		await testUser.deleteOne();
	}
	await dbConnection.disconnect();
	logger.info('Done!');
})();
