import { Static, Type } from "@sinclair/typebox";

export const BankAccount = Type.Object({
    id: Type.Required(Type.String()),
    name: Type.Required(Type.String()),
    icon: Type.Optional(Type.String())
})

export type BankAccountType = Static<typeof BankAccount>
