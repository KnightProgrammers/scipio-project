import CategoryService from '@/services/category.service';
import CreditCardService from '@/services/credit-card-service';
import CurrencyService from '@/services/currency.service';
import { DateTime } from 'luxon';

export const ExpenseQueryResolver = {
	billableDate: (expense: any) => {
		return DateTime.fromJSDate(expense.billableDate).toISO({includeOffset: false});
	},
	category: async (expense: any, params: any, ctx: any) => {
		return CategoryService.findOne(expense.categoryId, ctx.auth._id);
	},
	currency: async (expense: any) => {
		return CurrencyService.findOne(expense.currencyId);
	},
	creditCard: async (expense: any, params: any, ctx: any) => {
		return CreditCardService.findOne(expense.creditCardId, ctx.auth._id);
	}
};
