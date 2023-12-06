import SavingSchema from '@/models/saving.model';
import { ObjectId } from '@fastify/mongodb';
import { DateTime } from 'luxon';

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
		return SavingSchema.find({ userId, status: statuses }).sort({ targetDate: 1 });
	}
	static async getAllByBankAccount(userId: string, bankAccountId: string, statuses?: SAVING_STATUS_TYPE[]) {
		return SavingSchema.find({ userId, bankAccountId, status: statuses }).sort({ targetDate: 1 });
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

		let newStatus: SAVING_STATUS_TYPE = status;

		if (DateTime.fromJSDate(targetDate).toMillis() < DateTime.now().toMillis()) {
			newStatus = 'EXPIRED';
		}

		try {
			saving = await SavingSchema.create({
				name,
				description,
				status: newStatus,
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
			targetAmount,
			bankAccountId,
			currencyId
		} = data;

		const saving = await this.findOne(id, userId);

		if (!saving) return null;

		let newStatus: SAVING_STATUS_TYPE = status;

		if (DateTime.fromJSDate(targetDate).toMillis() < DateTime.now().toMillis()) {
			newStatus = 'EXPIRED';
		}

		saving.name = name;
		saving.description = description;
		saving.status = newStatus;
		saving.targetDate = targetDate;
		saving.targetAmount = targetAmount;
		saving.bankAccountId = new ObjectId(bankAccountId);
		saving.currencyId = new ObjectId(currencyId);

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
