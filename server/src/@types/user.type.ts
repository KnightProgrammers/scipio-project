import { Static, Type } from '@sinclair/typebox';

export const User = Type.Object({
	id: Type.Readonly(Type.String()),
	name: Type.Required(Type.String()),
	email: Type.Required(Type.String({ format: 'email' })),
	avatar: Type.Readonly(Type.Union([Type.String(), Type.Null()])),
	country: Type.Required(Type.String()),
});

export type UserType = Static<typeof User>
