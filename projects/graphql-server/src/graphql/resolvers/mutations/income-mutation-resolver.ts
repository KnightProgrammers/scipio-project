import IncomeService from '@/services/income.service';
import BankAccountService from '@/services/bank-account.service';
import { DateTime } from 'luxon';
import { errorCodes } from 'fastify';

type IncomeInput = {
	amount: number,
	incomeDate: string,
	description?: string,
	bankAccountId: string,
}

export const IncomeMutation = {
	createExpense: async (root: any, params: { input: IncomeInput }, context: any) => {
		const userId = context.auth._id;
		const {
			amount,
			incomeDate,
			description = '',
			bankAccountId
		} = params.input;

		const bankAccount = await BankAccountService.findOne(bankAccountId, userId);
		if (!bankAccount) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Bank Account');
		}

		return IncomeService.create(userId, {
			amount,
			incomeDate: DateTime
				.fromISO(incomeDate)
				.set({
					hour: 0,
					minute: 0,
					second: 0,
					millisecond: 0
				})
				.toJSDate(),
			description,
			bankAccountId
		});
	},
	deleteExpense: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		return IncomeService.delete(id, context.auth._id);
	},
};
