import { DateTime } from 'luxon';
import ExpenseModel from '@/models/expense.model';
import CreditCardMonthlyStatementService from '@/services/credit-card-monthly-statement.service';

interface ExpenseInput {
	amount: number,
	billableDate: Date,
	description?: string,
	currencyId: string,
	categoryId: string,
	creditCardId?: string,
	bankAccountId?: string,
}

const parseFilterDate = (stringDate: string | undefined, defaultDay: number) => {
	const formattedDate = stringDate ?
		DateTime.fromISO(stringDate) :
		DateTime.now().set({day: defaultDay});

	return formattedDate.set({hour: 0, minute: 0, second: 0, millisecond: 0});
};

class ExpenseService {
	static async getAll(userId: string, fromDate?: string, toDate?: string) {
		const formattedFromDate = parseFilterDate(fromDate, 1);
		const formattedToDate = parseFilterDate(toDate, 32);

		return ExpenseModel
			.find({
				userId,
				billableDate: {
					$gte: formattedFromDate.toJSDate(),
					$lte: formattedToDate.toJSDate()
				},
				isDeleted: false
			})
			.sort({ billableDate: -1 });
	}
	static async getAllByCategory(userId: string, categoryId: string, fromDate?: string, toDate?: string) {
		const formattedFromDate = parseFilterDate(fromDate, 1);
		const formattedToDate = parseFilterDate(toDate, 32);

		return ExpenseModel
			.find({
				userId,
				categoryId,
				billableDate: {
					$gte: formattedFromDate.toJSDate(),
					$lte: formattedToDate.toJSDate()
				},
				isDeleted: false
			})
			.sort({ billableDate: -1 });
	}
	static async getAllByCreditCard(userId: string, creditCardId: string, fromDate?: string, toDate?: string) {
		const formattedFromDate = parseFilterDate(fromDate, 1);
		const formattedToDate = parseFilterDate(toDate, 32);

		return ExpenseModel
			.find({
				userId,
				creditCardId,
				billableDate: {
					$gte: formattedFromDate.toJSDate(),
					$lte: formattedToDate.toJSDate()
				},
				isDeleted: false
			})
			.sort({ billableDate: -1 });
	}
	static async getAllByCurrency(userId: string, currencyId: string, fromDate?: string, toDate?: string) {
		const formattedFromDate = parseFilterDate(fromDate, 1);
		const formattedToDate = parseFilterDate(toDate, 32);

		return ExpenseModel
			.find({
				userId,
				currencyId,
				billableDate: {
					$gte: formattedFromDate.toJSDate(),
					$lte: formattedToDate.toJSDate()
				},
				isDeleted: false
			})
			.sort({ billableDate: -1 });
	}
	static async getAllByCreditCardMonthlyStatement(userId: string, creditCardMonthlyStatementId: string) {
		return ExpenseModel
			.find({
				userId,
				creditCardMonthlyStatementId,
				isDeleted: false
			})
			.sort({ billableDate: -1 });
	}
	static async getAllWithoutCreditCardMonthlyStatement(userId: string, creditCardId: string, toDate?: Date) {
		const query: any = {
			userId,
			creditCardId,
			creditCardMonthlyStatementId: { $exists: false },
			isDeleted: false
		};

		if (toDate) {
			query.billableDate = {
				$lte: toDate
			};
		}

		return ExpenseModel
			.find(query)
			.sort({ billableDate: -1 });
	}
	static async create(userId: string, data: ExpenseInput) {
		const {
			amount,
			billableDate,
			description = '',
			currencyId,
			categoryId,
			creditCardId,
			bankAccountId
		} = data;

		let type: string = 'CASH';

		let creditCardMonthlyStatementId = undefined;

		if (creditCardId) {
			type = 'CREDIT_CARD';

			const credtiCardStatements: any[] = await CreditCardMonthlyStatementService.findOldestStatement(creditCardId, userId, billableDate);
			if (credtiCardStatements.length) {
				creditCardMonthlyStatementId = credtiCardStatements[0]._id;
			}
		}

		if (bankAccountId) {
			type = 'BANK_ACCOUNT';
		}

		return ExpenseModel.create({
			amount,
			billableDate,
			description,
			type,
			currencyId,
			categoryId,
			creditCardId,
			creditCardMonthlyStatementId,
			bankAccountId,
			userId,
			isDeleted: false
		});
	}
	static async delete(id: string, user: any) {
		const category = await this.findOne(id, user);
		if (!category) return null;
		category.isDeleted = true;
		return category.save();
	}
	static async findOne(id: string, userId: any) {
		return ExpenseModel.findOne({ _id: id, userId, isDeleted: false });
	}
}

export default ExpenseService;
