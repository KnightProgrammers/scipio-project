import ExpenseService from '@/services/expense.service';

export const CategoryQueryResolver = {
	expenses: async (category: any, params: {fromDate?: string, toDate?: string}, ctx: any) => {
		return ExpenseService.getAllByCategory(ctx.auth._id, category._id, params.fromDate, params.toDate);
	}
};
