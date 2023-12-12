import BankAccountService from '@/services/bank-account.service';
import BankService from '@/services/bank.service';
import { errorCodes } from 'fastify';
import CurrencyService from '@/services/currency.service';

type BankAccountInput = {
	label: string
	accountNumber: string
	balance: number
	bankId: string
	currencyId: string
}

export const BankAccountMutation = {
	createBankAccount: async (root: any, params: { input: BankAccountInput }, context: any) => {
		const { label, accountNumber, balance, bankId, currencyId } = params.input;
		const bank = await BankService.findOne(bankId, context.auth);
		if (!bank) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank');
		}
		const accountCurrency =
			await CurrencyService.findOne(currencyId);
		if (!accountCurrency) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
		}
		return BankAccountService.create({
			accountName: label,
			accountNumber,
			accountBalance: balance,
			accountBankId: bankId,
			accountCurrency,
			accountUserId: context.auth._id,
		});
	},
	updateBankAccount: async (root: any, params: {id: string, input: BankAccountInput}, context: any) => {
		const { id, input } = params;
		const { label, accountNumber, balance,  } = input;
		const bankAccount = await BankAccountService.findOne(id, context.auth);
		if (!bankAccount) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
		}
		return BankAccountService.update(id, context.auth, {
			accountName: label,
			accountNumber,
			accountBalance: balance
		});
	},
	updateBankAccountBalance: async (root: any, params: {id: string, balance: number}, context: any)=> {
		const bankAccount = await BankAccountService.findOne(params.id, context.auth._id);
		if (!bankAccount) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
		}
		return BankAccountService.updateBalance(params.id, context.auth._id, params.balance);
	},
	deleteBankAccount: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		const bankAccount = await BankAccountService.findOne(id, context.auth);
		if (!bankAccount) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
		}
		try {
			await BankAccountService.delete(id, context.auth);
			return true;
		} catch {
			return false;
		}
	},
};
