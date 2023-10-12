import BankService from "@/services/bank.service";

export const BankAccountQueryResolver = {
    id: (bankAccount: any) => bankAccount._id,
    balance: (bankAccount: any) => bankAccount.accountBalance,
    label: (bankAccount: any) => bankAccount.accountName,
    bank: async (bankAccount: any, params: any, ctx: any) => {
        return BankService.findOne(bankAccount.accountBankId, ctx.auth)
    },
    currency: async (bankAccount: any) => {
        return bankAccount.accountCurrency;
    }
}
