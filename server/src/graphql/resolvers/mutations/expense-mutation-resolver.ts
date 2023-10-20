import ExpenseService from '@/services/expense.service';
import CategoryService from '@/services/category.service';
import CurrencyService from '@/services/currency.service';
import { errorCodes } from 'fastify';

type ExpenseInput = {
	amount: number,
	billableDate: string,
	description?: string,
	currencyId: string,
	categoryId: string,
}

export const ExpenseMutation = {
	createExpense: async (root: any, params: { input: ExpenseInput }, context: any) => {
		const userId = context.auth._id;
		const {
			currencyId,
			categoryId,
		} = params.input;

		const currency = await CurrencyService.findOne(currencyId);
		if (!currency) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
		}

		const category = await CategoryService.findOne(categoryId, userId);
		if (!category) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Category');
		}

		return ExpenseService.create(userId, params.input);
	},
	deleteExpense: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		const category = await ExpenseService.delete(id, context.auth._id);
		return !!category;
	},
};
