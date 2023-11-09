import SavingService from '@/services/saving.service';
import CurrencyService from '@/services/currency.service';
import { errorCodes } from 'fastify';
import BankAccountService from '@/services/bank-account.service';
import { DateTime } from 'luxon';

type SavingInput = {
	name: string;
	description?: string;
	status: 'IN_PROGRESS'|'COMPLETED'|'NOT_CONCLUDED'|'EXPIRED';
	targetDate: string;
	targetAmount: number;
	bankAccountId: string;
}

export const SavingMutation = {
	createSaving: async (root: any, params: { input: SavingInput }, context: any) => {
		const {
			name,
			description,
			status,
			targetDate,
			targetAmount,
			bankAccountId
		} = params.input;

		const bankAccount = await BankAccountService.findOne(bankAccountId, context.auth._id);
		if (!bankAccount) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
		}

		const currency = await CurrencyService.findByCode(bankAccount.accountCurrency.code);
		if (!currency) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
		}

		return SavingService.create({
			name,
			description,
			status,
			targetDate: DateTime
				.fromISO(targetDate)
				.set({
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0
				})
				.toJSDate(),
			targetAmount,
			currencyId: currency.id,
			bankAccountId,
			userId: context.auth._id,
		});
	},
	updateSaving: async (root: any, params: {id: string, input: SavingInput}, context: any) => {
		const { id, input } = params;
		const {
			name,
			description,
			status,
			targetDate,
			targetAmount,
			bankAccountId
		} = input;

		const bankAccount = await BankAccountService.findOne(bankAccountId, context.auth._id);
		if (!bankAccount) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
		}

		const currency = await CurrencyService.findByCode(bankAccount.accountCurrency.code);
		if (!currency) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
		}

		return SavingService.update(
			id,
			context.auth._id,
			{
				name,
				description,
				status,
				targetDate: DateTime
					.fromISO(targetDate)
					.set({
						hour: 0,
						minute: 0,
						second: 0,
						millisecond: 0
					})
					.toJSDate(),
				targetAmount,
				currencyId: currency.id,
				bankAccountId,
				userId: context.auth._id,
			});
	},
	deleteSaving: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		try {
			return SavingService.delete(id, context.auth._id);
		} catch {
			return false;
		}
	},
};
