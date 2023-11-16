import BankService from '@/services/bank.service';
import SavingService from '@/services/saving.service';

export const BankAccountQueryResolver = {
	id: (bankAccount: any) => bankAccount._id,
	balance: (bankAccount: any) => bankAccount.accountBalance,
	label: (bankAccount: any) => bankAccount.accountName,
	bank: async (bankAccount: any, params: any, ctx: any) => {
		return BankService.findOne(bankAccount.accountBankId, ctx.auth);
	},
	currency: async (bankAccount: any) => {
		return bankAccount.accountCurrency;
	},
	savings: async (bankAccount: any, params: any, ctx: any) => {
		return SavingService.getAllByBankAccount(ctx.auth._id, bankAccount.id, params.statuses);
	},
};
