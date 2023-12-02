import CreditCardMonthlyStatementSchema from '@/models/credit-card-monthly-statement.model';
import ExpenseService from '@/services/expense.service';

class CreditCardMonthlyStatementService {
	static async getAll(userId: string, creditCardId: string, limit: number = 3) {
		return CreditCardMonthlyStatementSchema
			.find({
				userId,
				creditCardId
			})
			.sort({ closeDate: -1 })
			.limit(limit);
	}

	static async create(userId: string, data: {
		closeDate: Date,
		creditCardId: string
	}) {
		const {
			closeDate,
			creditCardId
		} = data;
		const monthlyStatement: any = await CreditCardMonthlyStatementSchema.create({
			closeDate,
			creditCardId,
			userId
		});

		const expenses = await ExpenseService.getAllWithoutCreditCardMonthlyStatement(userId, creditCardId, closeDate);

		for (const e of expenses) {
			e.creditCardMonthlyStatementId = monthlyStatement._id;
			e.save();
		}

		return monthlyStatement;
	}

	static async findOne(id: string, userId: string) {
		if (!id || !userId) return null;
		return CreditCardMonthlyStatementSchema.findOne({ _id: id, userId });
	}
}

export default CreditCardMonthlyStatementService;
