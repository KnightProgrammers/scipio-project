import BankAccountService from '@/services/bank-account.service';

export const BankQueryResolver = {
	id: (bank: any) => bank._id,
	bankAccounts: async (bank: any, params: any, ctx: any) => {
		return BankAccountService.getAll(bank, {id: ctx.auth._id});
	}
};
