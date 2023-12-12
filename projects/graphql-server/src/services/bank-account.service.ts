import BankAccountSchema from '@/models/bank-account.model';

class BankAccountService {
	static async getAll(
		userId: any,
		accountIsDeleted: boolean = false,
	): Promise<any> {
		return BankAccountSchema.find({
			accountUserId: userId,
			accountIsDeleted,
		});
	}
	static async getAllByBank(
		bankId: any,
		userId: any,
		accountIsDeleted: boolean = false,
	): Promise<any> {
		return BankAccountSchema.find({
			accountUserId: userId,
			accountBankId: bankId,
			accountIsDeleted,
		});
	}
	static async create(data: {
        accountName: string
        accountNumber: string
        accountBalance: number
        accountBankId: string
        accountUserId: string
        accountCurrency: any
    }) {
		const {
			accountName,
			accountNumber,
			accountBalance,
			accountBankId,
			accountCurrency,
			accountUserId,
		} = data;

		const newBankAccount = new BankAccountSchema({
			accountName,
			accountNumber,
			accountBalance,
			accountBankId,
			accountUserId,
			accountCurrency,
			accountIsDeleted: false,
		});

		await newBankAccount.save();

		return newBankAccount;
	}
	static async update(
		id: string,
		user: any,
		data: {
            accountName: string
            accountNumber: string
            accountBalance: number
        },
	) {
		const { accountName, accountBalance, accountNumber } = data;

		const bankAccount = await this.findOne(id, user);

		if (!bankAccount) return null;

		bankAccount.accountName = accountName;
		bankAccount.accountNumber = accountNumber;
		bankAccount.accountBalance = accountBalance;

		await bankAccount.save();

		return bankAccount;
	}
	static async updateBalance(id: string, userId: string, balance: number) {
		const bankAccount = await this.findOne(id, userId);
		if (!bankAccount) return null;
		bankAccount.accountBalance = balance;
		await bankAccount.save();
		return bankAccount;
	}
	static async delete(id: string, user: any) {
		const bankAccount = await this.findOne(id, user);

		if (!bankAccount) return null;

		bankAccount.accountIsDeleted = true;
		await bankAccount.save();

		return bankAccount;
	}

	static async findOne(id: string, userId: any) {
		const bankAccount = await BankAccountSchema.findOne({ _id: id, accountUserId: userId });
		if (!bankAccount) return null;
		return bankAccount;
	}
}

export default BankAccountService;
