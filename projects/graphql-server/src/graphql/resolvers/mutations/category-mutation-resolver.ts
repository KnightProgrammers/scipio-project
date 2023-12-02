import CategoryService from '@/services/category.service';

type CategoryInput = {
    name: string;
    type: 'NEED'|'WANT'|'SAVE';
    isFixedPayment: boolean;
}

export const CategoryMutation = {
	createCategory: async (root: any, params: { input: CategoryInput }, context: any) => {
		const { name, type, isFixedPayment,  } = params.input;
		return CategoryService.create(context.auth._id, {
			name,
			type,
			isFixedPayment
		});
	},
	updateCategory: async (root: any, params: {id: string, input: CategoryInput}, context: any) => {
		const { id, input } = params;
		const { name, type, isFixedPayment,  } = input;
		return CategoryService.update(id, context.auth._id, {
			name,
			type,
			isFixedPayment
		});
	},
	deleteCategory: async (root: any, params: {id: string}, context: any) => {
		const {id} = params;
		const category = await CategoryService.delete(id, context.auth._id);
		return !!category;
	},
};
