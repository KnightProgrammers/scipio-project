import { Static, Type } from '@sinclair/typebox'
import { Currency } from '@/@types/currency.type'

export const BankAccount = Type.Object({
    id: Type.Optional(Type.Readonly(Type.String())),
    accountName: Type.Optional(Type.String()),
    accountNumber: Type.Required(Type.String()),
    accountBalance: Type.Required(Type.Number()),
    accountIsDeleted: Type.Optional(Type.Boolean()),
    accountCurrency: Type.Required(Currency),
    accountBankId: Type.Required(Type.Any()),
    accountUserId: Type.Readonly(Type.Optional(Type.Any())),
})
export const NewBankAccountBody = Type.Object({
    accountName: Type.Optional(Type.String()),
    accountNumber: Type.Required(Type.String()),
    accountBalance: Type.Required(Type.Number()),
    accountCurrencyId: Type.Required(Type.Any()),
    accountBankId: Type.Required(Type.Any()),
})

export type BankAccountType = Static<typeof BankAccount>
