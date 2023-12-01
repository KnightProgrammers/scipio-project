import mongoose from 'mongoose';
import { CountrySchema } from './country.model';
import { CurrencySchema } from './currency.model';

export const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		avatar: String,
		lang: String,
		firebaseId: {
			type: String,
			required: true,
			unique: true,
		},
		country: CountrySchema,
		currencies: [CurrencySchema],
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
