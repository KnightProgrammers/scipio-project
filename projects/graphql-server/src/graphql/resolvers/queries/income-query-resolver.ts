import CurrencyService from '@/services/currency.service';
import BankAccountService from '@/services/bank-account.service';
import { DateTime } from 'luxon';

export const IncomeQueryResolver = {
	incomeDate: (income: any) => {
		return DateTime.fromJSDate(income.incomeDate).toISO({includeOffset: false});
	},
	currency: async (income: any) => {
		return CurrencyService.findOne(income.currencyId);
	},
	bankAccount: async (income: any, params: any, ctx: any) => {
		return BankAccountService.findOne(income.bankAccountId, ctx.auth._id);
	}
};
