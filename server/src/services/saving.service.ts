import SavingSchema from '@/models/saving.model';

export type SAVING_STATUS_TYPE = 'IN_PROGRESS'|'COMPLETED'|'NOT_CONCLUDED'|'EXPIRED'

type SavingInputData = {
	name: string;
	description?: string;
	status: SAVING_STATUS_TYPE;
	targetDate: Date;
	targetAmount: number;
	currencyId: string;
	bankAccountId: string;
	userId: string;
}

class SavingService {
	static async getAll(userId: string, statuses?: SAVING_STATUS_TYPE[]) {
		console.log({statuses});
		return SavingSchema.find({ userId }).sort({ targetDate: 1 });
	}
	static async create(data: SavingInputData) {
		const {
			name,
			description,
			userId,
			status,
			targetDate,
			targetAmount,
			currencyId,
			bankAccountId
		} = data;
		let saving = null;

		try {
			saving = await SavingSchema.create({
				name,
				description,
				status,
				targetDate,
				targetAmount,
				currencyId,
				bankAccountId,
				userId
			});
		} catch (e: any) {
			throw new Error(e.message);
		}

		return saving;
	}
	static async update(id: string, userId: string, data: SavingInputData) {
		const {
			name,
			description,
			status,
			targetDate,
			targetAmount
		} = data;

		const saving = await this.findOne(id, userId);

		if (!saving) return null;

		saving.name = name;
		saving.description = description;
		saving.status = status;
		saving.targetDate = targetDate;
		saving.targetAmount = targetAmount;

		await saving.save();
		try {
			await saving.save();
		} catch (e: any) {
			throw new Error(e.message);
		}

		return saving;
	}
	static async delete(id: string, userId: string) {
		const saving = await this.findOne(id, userId);
		if (!saving) return false;
		await saving.deleteOne();
		return true;
	}
	static async findOne(id: string, userId: string) {
		return SavingSchema.findOne({ _id: id, userId });
	}
}

export default SavingService;
