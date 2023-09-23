import BankAccountSchema from "@/models/bank-account.model";
import { UserType } from "@/routes/users";

class BankAccountService {
    static async getAll(bankId: string, user: UserType) {
        return BankAccountSchema.find({
            accountUser: user,
            accountBank: bankId,
            accountIsDeleted: false
        });
    }
    static async create(data: {name: string, user: UserType}) {
        const { name, user } = data;
        return BankAccountSchema.create({ name, user });
    }
    static async update(id: string, user: UserType, data: { accountNumber: string, accountBalance: number }) {
        const { accountBalance, accountNumber } = data;

        const bankAccount = await BankAccountSchema.findOne({_id: id, accountUser: user});

        if (!bankAccount) return null;

        bankAccount.accountNumber = accountNumber;
        bankAccount.accountBalance = accountBalance;

        await bankAccount.save()

        return bankAccount;
    }
    static async delete(id: string, user: UserType) {
        const bankAccount = await BankAccountSchema.findOne({_id: id, accountUser: user});

        if (!bankAccount) return null;

        bankAccount.accountIsDeleted = true;
        await bankAccount.save()

        return bankAccount;
    }
}

export default BankAccountService;
