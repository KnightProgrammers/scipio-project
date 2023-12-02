import CategorySchema from '@/models/category.model';

class CategoryService {
	static async getAll(userId: string) {
		return CategorySchema.find({ userId, isDeleted: false }).sort({ name: 1 });
	}
	static async create(userId: string, data: { name: string; type: 'NEED'|'WANT'|'SAVE', isFixedPayment: boolean },) {
		const { name, type, isFixedPayment } = data;
		return CategorySchema.create({
			name,
			type,
			isFixedPayment,
			userId,
			isDeleted: false
		});
	}
	static async update(
		id: string,
		userId: string,
		data: { name: string; type: 'NEED'|'WANT'|'SAVE', isFixedPayment: boolean },
	) {
		const { name, type, isFixedPayment } = data;

		const category = await CategorySchema.findOne({ _id: id, userId });

		if (!category) return null;

		category.name = name;
		category.type = type;
		category.isFixedPayment = isFixedPayment;

		await category.save();

		return category;
	}
	static async delete(id: string, user: any) {
		const category = await this.findOne(id, user);
		if (!category) return null;
		category.isDeleted = true;
		return category.save();
	}
	static async findOne(id: string, userId: any) {
		return CategorySchema.findOne({ _id: id, userId });
	}
}

export default CategoryService;
