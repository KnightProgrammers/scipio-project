import CategoryService from '@/services/category.service';
import CurrencyService from '@/services/currency.service';
import { DateTime } from 'luxon';

export const ExpenseQueryResolver = {
	billableDate: (expense: any) => {
		return DateTime.fromJSDate(expense.billableDate).toFormat('dd/MM/yyyy');
	},
	category: async (expense: any, params: any, ctx: any) => {
		return CategoryService.findOne(expense.categoryId, ctx.auth._id);
	},
	currency: async (expense: any) => {
		return CurrencyService.findOne(expense.currencyId);
	}
};
