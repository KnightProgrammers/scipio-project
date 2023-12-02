import BankSchema from '@/models/bank.model';
import bankAccountService from '@/services/bank-account.service';

class BankService {
	static async getAll(user: any) {
		return BankSchema.find({ user }).sort({ name: 1 });
	}
	static async create(data: { name: string; user: any }) {
		const { name, user } = data;
		return BankSchema.create({ name, user });
	}
	static async update(
		id: string,
		user: any,
		data: { name: string; icon?: string },
	) {
		const { name, icon } = data;

		const bank = await BankSchema.findOne({ _id: id, user });

		if (!bank) return null;

		bank.name = name;
		bank.icon = icon;

		await bank.save();

		return bank;
	}
	static async delete(id: string, user: any) {
		const bank = await this.findOne(id, user);
		if (!bank) return null;
		const bankAccounts = await bankAccountService.getAllByBank(bank, user, true);
		await bank.deleteOne();
		for (const bankAccount of bankAccounts) {
			await bankAccount.deleteOne();
		}
	}
	static async findOne(id: string, user: any) {
		return BankSchema.findOne({ _id: id, user });
	}
}

export default BankService;
