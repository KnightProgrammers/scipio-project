import CreditCardService from '@/services/credit-card-service';
import CreditCardMonthlyStatementService from '@/services/credit-card-monthly-statement.service';
import { DateTime } from 'luxon';
import { errorCodes } from 'fastify';

export const CreditCardMonthlyStatementMutationResolver = {
	createCreditCardMonthlyStatement: async (
		root: any,
		params: { closeDate: string, creditCardId: string },
		ctx: any
	) => {
		const {
			closeDate,
			creditCardId
		} = params;
		const userId = ctx.auth._id;
		
		const creditCard = await CreditCardService.findOne(creditCardId, userId);
		if (!creditCard)  {
			throw new errorCodes.FST_ERR_NOT_FOUND('CreditCard');
		}

		return CreditCardMonthlyStatementService.create(userId, {
			closeDate: DateTime.fromISO(closeDate).toJSDate(),
			creditCardId
		});
	},
};
