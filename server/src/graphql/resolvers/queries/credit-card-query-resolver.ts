import { DateTime } from 'luxon';
import ExpenseService from '@/services/expense.service';
import CreditCardMonthlyStatementService from '@/services/credit-card-monthly-statement.service';

export const CreditCardQueryResolver = {
	expiration: (creditCard: any) => {
		return DateTime.fromJSDate(creditCard.expiration).toFormat('MM/yy');
	},
	expenses: async (creditCard: any, params: {fromDate?: string, toDate?: string}, ctx: any) => {
		return ExpenseService.getAllByCreditCard(ctx.auth._id, creditCard._id, params.fromDate, params.toDate);
	},
	monthlyStatements: async (creditCard: any, params: any, ctx: any) => CreditCardMonthlyStatementService.getAll(ctx.auth._id, creditCard._id),
	expensesNextStatement: async (creditCard: any, params: any, ctx: any) => ExpenseService.getAllWithoutCreditCardMonthlyStatement(ctx.auth._id, creditCard._id)
};
