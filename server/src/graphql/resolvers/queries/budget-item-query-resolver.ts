import CategoryService from "@/services/category.service"

export const BudgetItemQueryResolver = {
    category: async (budgetItem: any, params: any, ctx: any) => {
        return CategoryService.findOne(budgetItem.categoryId, ctx.auth._id)
    }
}