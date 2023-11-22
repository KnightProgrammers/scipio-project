import BudgetService from "@/services/budget.service"

export const BudgetQueryResolver = {
    items: async (budget: any, params: any, ctx: any) => {
        return BudgetService.getAllItems(budget._id, ctx.auth._id)
    }
}