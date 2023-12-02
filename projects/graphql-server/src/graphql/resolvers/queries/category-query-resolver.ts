import ExpenseService from '@/services/expense.service';
import BudgetService from '@/services/budget.service';

export const CategoryQueryResolver = {
	expenses: async (category: any, params: {fromDate?: string, toDate?: string}, ctx: any) => {
		return ExpenseService.getAllByCategory(ctx.auth._id, category._id, params.fromDate, params.toDate);
	},
	budget: async (category: any, params: any, ctx: any) => {
		return BudgetService.findItemsByCategory(category._id, ctx.auth._id);
	}
};
