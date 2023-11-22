import BudgetService from "@/services/budget.service";

type BudgetItemInput = {
    budgetId: string
    categoryId: string
    currencies: [{
        currencyCode: string,
        limit: number
    }]
}

export const BudgetMutation = {
	createBudget: async (root: any, params: any, context: any) => {
		return BudgetService.create({
			userId: context.auth._id,
		});
	},
    upsertBudgetItem: async (root: any, params: { input: BudgetItemInput }, context: any) => {
        return BudgetService.upsertBudgetItem(params.input, context.auth._id);
    },
    deleteBudgetItem: (root: any, params: { id: string, budgetId: string }, context: any) => {
        return BudgetService.deleteBudgetItem(params.budgetId, params.id, context.auth._id);
    }
}