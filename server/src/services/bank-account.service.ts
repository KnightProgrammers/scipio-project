import BankAccountSchema from "@/models/bank-account.model";
import { UserType } from "@/routes/users";
import { BankAccountType } from "@/@types/bank-account.type";
import {CurrencyType} from "@/@types/currency.type";
import { BankType } from "@/@types/bank.type";

class BankAccountService {
    static async getAll(bank: BankType, user: UserType): Promise<BankAccountType[]> {
        return BankAccountSchema.find({
            accountUserId: user.id,
            accountBankId: bank.id,
            accountIsDeleted: false
        });
    }
    static async create(data: {
        accountName: string,
        accountNumber: string,
        accountBalance: number
        accountBankId: string,
        accountUserId: string,
        accountCurrency: CurrencyType,
    }) {
        const {
            accountName,
            accountNumber,
            accountBalance,
            accountBankId,
            accountCurrency,
            accountUserId
        } = data;
        return BankAccountSchema.create({
            accountName,
            accountNumber,
            accountBalance,
            accountBankId,
            accountUserId,
            accountCurrency,
            accountIsDeleted: false
        });
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
