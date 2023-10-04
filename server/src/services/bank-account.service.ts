import BankAccountSchema from '@/models/bank-account.model'
import { UserType } from '@/routes/users'
import { BankType } from '@/@types/bank.type'

class BankAccountService {
    static async getAll(
        bank: BankType,
        user: UserType,
        accountIsDeleted: boolean = false,
    ): Promise<any> {
        return BankAccountSchema.find({
            accountUserId: user.id,
            accountBankId: bank.id,
            accountIsDeleted,
        })
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
        } = data

        const newBankAccount = new BankAccountSchema({
            accountName,
            accountNumber,
            accountBalance,
            accountBankId,
            accountUserId,
            accountCurrency,
            accountIsDeleted: false,
        })

        await newBankAccount.save()

        return newBankAccount
    }
    static async update(
        id: string,
        user: UserType,
        data: {
            accountName: string
            accountNumber: string
            accountBalance: number
        },
    ) {
        const { accountName, accountBalance, accountNumber } = data

        const bankAccount = await this.findOne(id, user)

        if (!bankAccount) return null

        bankAccount.accountName = accountName
        bankAccount.accountNumber = accountNumber
        bankAccount.accountBalance = accountBalance

        await bankAccount.save()

        return bankAccount
    }
    static async delete(id: string, user: UserType) {
        const bankAccount = await this.findOne(id, user)

        if (!bankAccount) return null

        bankAccount.accountIsDeleted = true
        await bankAccount.save()

        return bankAccount
    }

    static async findOne(id: string, user: UserType) {
        return BankAccountSchema.findOne({ _id: id, accountUserId: user.id })
    }
}

export default BankAccountService
