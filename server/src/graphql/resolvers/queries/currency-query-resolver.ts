import ExpenseService from '@/services/expense.service';
import BudgetService from '@/services/budget.service';

export const CurrencyQueryResolver = {
	expenses: async (currency: any, params: {fromDate?: string, toDate?: string}, ctx: any) => {
		return ExpenseService.getAllByCurrency(ctx.auth._id, currency.id, params.fromDate, params.toDate);
	},
	budget: async (currency: any, params: any, ctx: any) => {
		return BudgetService.getTotalBudgetByCurrency(currency.code, ctx.auth._id);
	}
};
