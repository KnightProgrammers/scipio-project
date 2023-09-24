import { Static, Type } from "@sinclair/typebox";

export const Currency = Type.Object({
    id: Type.Optional(Type.String()),
    name: Type.Required(Type.String()),
    code: Type.Required(Type.String())
})

export type CurrencyType = Static<typeof Currency>
