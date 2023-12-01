import mongoose from 'mongoose';
import { CurrencySchema } from './currency.model';

export const BankAccountSchema = new mongoose.Schema(
	{
		accountName: {
			type: String,
			required: false,
		},
		accountNumber: {
			type: String,
			required: true,
		},
		accountBalance: {
			type: Number,
			default: 0,
			required: true,
		},
		accountIsDeleted: {
			type: Boolean,
			default: false,
		},
		accountUserId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		accountBankId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Bank',
			required: true,
		},
		accountCurrency: {
			type: CurrencySchema,
			required: true,
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
