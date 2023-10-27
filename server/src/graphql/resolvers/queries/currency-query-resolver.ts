import ExpenseService from '@/services/expense.service';

export const CurrencyQueryResolver = {
	expenses: async (currency: any, params: {fromDate?: string, toDate?: string}, ctx: any) => {
		return ExpenseService.getAllByCurrency(ctx.auth._id, currency.id, params.fromDate, params.toDate);
	}
};
