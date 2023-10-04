import { Static, Type } from '@sinclair/typebox';

export const Bank = Type.Object({
	id: Type.Optional(Type.String()),
	name: Type.Required(Type.String()),
	icon: Type.Optional(Type.String()),
});

export type BankType = Static<typeof Bank>
