import ExpenseService from '@/services/expense.service';
import CategoryService from '@/services/category.service';
import CurrencyService from '@/services/currency.service';
import CreditCardService from '@/services/credit-card-service';
import { DateTime } from 'luxon';
import { errorCodes } from 'fastify';

type ExpenseInput = {
	amount: number,
	billableDate: string,
	description?: string,
	currencyId: string,
	categoryId: string,
	creditCardId?: string
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
		});
	},
	deleteExpense: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		const category = await ExpenseService.delete(id, context.auth._id);
		return !!category;
	},
};
