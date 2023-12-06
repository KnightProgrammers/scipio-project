import CreditCardService from '@/services/credit-card-service';
import ExpenseService from '@/services/expense.service';

import { DateTime } from 'luxon';

export const CreditCardMonthlyStatementQueryResolver = {
	creditCard: async (creditCardMonthlyStatement: any, params: any, ctx: any) => {
		return CreditCardService.findOne(creditCardMonthlyStatement.creditCardId, ctx.auth._id);
	},
	closeDate: (creditCardMonthlyStatement: any) => DateTime.fromJSDate(creditCardMonthlyStatement.closeDate).toISO({includeOffset: false}),
	expenses: async (creditCardMonthlyStatement: any, params: any, ctx: any) => {
		return ExpenseService.getAllByCreditCardMonthlyStatement(ctx.auth._id, creditCardMonthlyStatement._id);
	}
};
