import mongoose from 'mongoose';
import { CurrencySchema } from '@/models/currency.model';

export const BankSchema = new mongoose.Schema(
	{
		label: {
			type: String,
		},
		cardHolder: {
			type: String,
			required: true,
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
			defaultValue: 'other'
		},
		status: {
			type: String,
			required: true,
			enum : ['ACTIVE', 'EXPIRED', 'BLOCKED'],
			defaultValue: 'ACTIVE'
		},
		creditLimitAmount: {
			type: Number,
			defaultValue: 0
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

export default mongoose.model('CreditCard', BankSchema);
