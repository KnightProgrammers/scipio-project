import BudgetSchema from '@/models/budget.model';
import BudgetCategorySchema from '@/models/budget-category.model';
import CategoryService from '@/services/category.service';
import { errorCodes } from 'fastify';
import CurrencyService from './currency.service';

type BudgetInput = {
    userId: string
}

type BudgetItemInput = {
    budgetId: string
    categoryId: string
    currencies: [{
        currencyCode: string,
        limit: number
    }]
}

class BudgetService {
	static async findAllByUserId(userId: string): Promise<any[]> {
		return BudgetSchema.find({
			userId
		});
	}
	static async findById(id: string, userId: string): Promise<any> {
		return BudgetSchema.findOne({
			_id: id,
			userId
		});
	}
	static async create(data: BudgetInput): Promise<any> {
		const {
			userId
		} = data;
		return BudgetSchema.create({
			userId
		});
	}
	static async getAllItems(budgetId: string, userId: string) {
		const budget = await this.findById(budgetId, userId);
		if (!budget) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Budget');
		}
		return BudgetCategorySchema.find({
			budgetId
		});
	}
	static async upsertBudgetItem(data: BudgetItemInput, userId: string) {
		const {
			budgetId,
			categoryId,
			currencies
		} = data;
		const budget = await this.findById(budgetId, userId);
		if (!budget) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Budget');
		}
		const category = await CategoryService.findOne(categoryId, userId);
		if (!category) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Category');
		}

		let budgetCategory = await BudgetCategorySchema.findOne({
			budgetId,
			categoryId
		});

		if (!budgetCategory) {
			budgetCategory = await BudgetCategorySchema.create({
				budgetId,
				categoryId,
				currencies: []
			});
		}

		const userCurrencies = await Promise.all(currencies.map((c: any) => CurrencyService.findByCode(c.currencyCode)));

		if (userCurrencies.some((c) => c === null)) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Currency');
		}

		budgetCategory.currencies = currencies.map((c: any) => {
			return {
				currency: userCurrencies.find((uc: any) => uc.code === c.currencyCode),
				limit: c.limit
			};
		});

		await budgetCategory.save();

		return budgetCategory;
	}
	static async deleteBudgetItem(budgetId: string, budgetItemId: string, userId: string) {
		const budget = await this.findById(budgetId, userId);
		if (!budget) {
			throw new errorCodes.FST_ERR_NOT_FOUND('Budget');
		}
		const budgetItem = await BudgetCategorySchema.findOne({
			_id: budgetItemId,
			budgetId
		});
		if (!budgetItem) {
			return false;
		}
		await budgetItem.deleteOne();
		return true;
	}
}

export default BudgetService;
