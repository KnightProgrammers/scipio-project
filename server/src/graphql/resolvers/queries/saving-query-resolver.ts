import BankAccountService from '@/services/bank-account.service';
import CurrencyService from '@/services/currency.service';
import { DateTime } from "luxon";

export const SavingQueryResolver = {
	id: (bank: any) => bank._id,
	bankAccount: async (saving: any, params: any, ctx: any) => {
		return BankAccountService.findOne(saving.bankAccountId, ctx.auth._id);
	},
	currency: async (saving: any) => {
		return CurrencyService.findOne(saving.currencyId)
	},
	targetDate: async (saving: any) => {
		return DateTime.fromJSDate(saving.targetDate).toISO()
	}
};
