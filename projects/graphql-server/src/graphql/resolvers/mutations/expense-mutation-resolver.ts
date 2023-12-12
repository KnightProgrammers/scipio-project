import ExpenseService from '@/services/expense.service';
import CategoryService from '@/services/category.service';
import CurrencyService from '@/services/currency.service';
import CreditCardService from '@/services/credit-card-service';
import BankAccountService from '@/services/bank-account.service';
import { DateTime } from 'luxon';
import { errorCodes } from 'fastify';

type ExpenseInput = {
	amount: number,
	billableDate: string,
	description?: string,
	currencyId: string,
	categoryId: string,
	creditCardId?: string
	bankAccountId?: string
}

export const ExpenseMutation = {
	createExpense: async (root: any, params: { input: ExpenseInput }, context: any) => {
		const userId = context.auth._id;
		const {
			amount,
			billableDate,
			description,
			currencyId,
			categoryId,
			creditCardId,
			bankAccountId,
		} = params.input;

		const currency = await CurrencyService.findOne(currencyId);
		if (!currency) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
		}

		const category = await CategoryService.findOne(categoryId, userId);
		if (!category) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Category');
		}

		if (creditCardId) {
			const creditCard = await CreditCardService.findOne(creditCardId, userId);
			if (!creditCard) {
				throw new errorCodes.FST_ERR_NOT_FOUND('Credit Card');
			}
		}

		if (bankAccountId) {
			const bankAccount = await BankAccountService.findOne(bankAccountId, userId);
			if (!bankAccount) {
				throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
			}
		}

		return ExpenseService.create(userId, {
			amount,
			billableDate: DateTime
				.fromISO(billableDate)
				.set({
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0
				})
				.toJSDate(),
			description,
			currencyId,
			categoryId,
			creditCardId,
			bankAccountId
		});
	},
	deleteExpense: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		const category = await ExpenseService.delete(id, context.auth._id);
		return !!category;
	},
};
