import mongoose from 'mongoose';
import { CurrencySchema } from './currency.model';

export const CreditCardSchema = new mongoose.Schema(
	{
		label: {
			type: String,
			required: true,
		},
		cardHolder: {
			type: String,
		},
		lastFourDigits: {
			type: String,
		},
		expiration: {
			type: Date,
			required: true,
		},
		issuer: {
			type: String,
			required: true,
			enum : ['visa', 'mastercard', 'other'],
			default: 'other'
		},
		status: {
			type: String,
			required: true,
			enum : ['ACTIVE', 'EXPIRED', 'BLOCKED'],
			default: 'ACTIVE'
		},
		creditLimitAmount: {
			type: Number,
			default: 0
		},
		creditLimitCurrency: {
			type: CurrencySchema,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		}
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
