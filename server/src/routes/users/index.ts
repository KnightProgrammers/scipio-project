import { errorCodes } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import AuthMiddleware from '@/middlewares/auth.middleware';
import CountryModel from '@/models/country.model';
import CurrencyModel from '@/models/currency.model';

const UserCountry = Type.Object({
	code: Type.Readonly(Type.String()),
	name: Type.Readonly(Type.String()),
});
export const User = Type.Object({
	id: Type.Readonly(Type.String()),
	name: Type.Required(Type.String()),
	email: Type.Required(Type.String({ format: 'email' })),
	avatar: Type.Readonly(Type.Union([Type.String(), Type.Null()])),
	lang: Type.String(),
	country: Type.Optional(Type.Union([UserCountry, Type.Null()])),
});

export type UserType = Static<typeof User>

export const Currency = Type.Object({
	id: Type.Required(Type.String()),
	name: Type.Required(Type.String()),
	code: Type.Required(Type.String()),
});

export type CurrencyType = Static<typeof Currency>

const users: any = async (fastify: any): Promise<void> => {
	fastify.decorateRequest('user', null);
	fastify.addHook('onRequest', AuthMiddleware);

	fastify.post(
		'/me',
		{
			schema: {
				body: User,
				response: {
					200: User,
				},
			},
		},
		async function (request: any, reply: any) {
			const newData: UserType = request.body;
			const user = request.user;
			user.name = newData.name;
			user.lang = newData.lang;
			user.save();
			reply.status(200).send({
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar || null,
				lang: user.lang || null,
				country: {
					name: user.country.name,
					code: user.country.code,
				},
			});
		},
	);
	fastify.patch(
		'/me',
		{
			schema: {
				body: {
					type: 'object',
					properties: {
						country: {
							type: 'string',
						},
						lang: {
							type: 'string',
						},
						currencies: {
							type: 'array'
						},
					},
					additionalProperties: false,
				},
				response: {
					200: User,
				},
			},
		},
		async function (request: any, reply: any) {
			const { country: countryName, lang, currencies: currencyIds } = request.body;
			const country = await CountryModel.findOne({
				name: countryName,
				isSupported: true,
			});
			if (!country) {
				throw new errorCodes.FST_ERR_NOT_FOUND('Country');
			}
			const currencies = await CurrencyModel.find({_id: currencyIds});
			if (!currencies) {
				throw new errorCodes.FST_ERR_NOT_FOUND('Currencies');
			}
			const user = request.user;
			user.country = country;
			user.lang = lang;
			user.currencies = currencies;
			user.save();
			reply.status(200).send({
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar || null,
				lang: user.lang || null,
				country: {
					name: country.name,
					code: country.code,
				},
			});
		},
	);

	fastify.post(
		'/me/currencies',
		{
			schema: {
				body: {
					type: 'array',
					items: {
						type: 'string',
					},
				},
				response: {
					200: {
						type: 'array',
						items: Currency,
					},
				},
			},
		},
		async function (request: any, reply: any) {
			const selectedIds = request.body;
			const user = request.user;

			user.currencies = await CurrencyModel.find({ _id: selectedIds });
			user.save();

			reply.status(200).send(
				user.currencies.map((c: any) => ({
					id: c.id,
					name: c.name,
					code: c.code,
				})),
			);
		},
	);
};

export default users;
