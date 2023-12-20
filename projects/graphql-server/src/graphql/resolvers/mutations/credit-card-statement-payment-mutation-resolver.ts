import CreditCardStatementPaymentService from '@/services/credit-card-statement-payment.service';
import CreditCardMonthlyStatementService from '@/services/credit-card-monthly-statement.service';
import { DateTime } from 'luxon';
import { errorCodes } from 'fastify';

type CreateStatementPaymentInput = {
    paymentDate: string
	monthlyStatementId: string
    currencies: [{
        currencyCode: string
        amount: number
		type: 'TOTAL'|'PARTIAL'|'MINIMUM'
    }]
}

export const CreditCardStatementPaymentMutationResolver = {
	createCreditCardStatementPayment: async (
		root: any,
		params: { input: CreateStatementPaymentInput },
		ctx: any
	) => {
		const {
			paymentDate,
			monthlyStatementId,
			currencies
		} = params.input;
		const userId = ctx.auth._id;

		const monthlyStatement = await CreditCardMonthlyStatementService.findOne(monthlyStatementId, userId);

		if (!monthlyStatement) {
			throw new errorCodes.FST_ERR_NOT_FOUND('CreditCardMonthlyStatement');
		}
		
		return CreditCardStatementPaymentService.create(userId, {
			paymentDate: DateTime.fromISO(paymentDate),
			monthlyStatementId,
			currencies
		});
	},
	deleteCreditCardStatementPayment: async (root: any, params: { id: string }, ctx: any ) => {
		const userId = ctx.auth._id;
		return CreditCardStatementPaymentService.delete(params.id, userId);
	},
};
