import CurrencyService from '@/services/currency.service';
import BankAccountService from '@/services/bank-account.service';
import { DateTime } from 'luxon';

export const IncomeQueryResolver = {
	incomeDate: (expense: any) => {
		return DateTime.fromJSDate(expense.incomeDate).toISO({includeOffset: false});
	},
	currency: async (expense: any) => {
		return CurrencyService.findOne(expense.currencyId);
	},
	bankAccount: async (expense: any, params: any, ctx: any) => {
		return BankAccountService.findOne(expense.bankAccountId, ctx.auth._id);
	}
};
