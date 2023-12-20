import CreditCardMonthlyStatementService from '@/services/credit-card-monthly-statement.service';
import { DateTime } from 'luxon';

export const CreditCardStatementPaymentQueryResolver = {
	paymentDate: (creditCardStatementPayment: any) => DateTime.fromJSDate(creditCardStatementPayment.paymentDate).toISO({includeOffset: false}),
	monthlyStatement: async (creditCardStatementPayment: any, params: any, ctx: any) => 
		CreditCardMonthlyStatementService.findOne(creditCardStatementPayment.creditCardMonthlyStatementId, ctx.auth._id),
};
