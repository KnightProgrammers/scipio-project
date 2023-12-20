import mongoose from 'mongoose';
import { CurrencySchema } from './currency.model';

export const CreditCardStatementPaymentSchema = new mongoose.Schema(
	{
		paymentDate: {
			type: Date,
			required: true,
		},
		creditCardMonthlyStatementId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CreditCardMonthlyStatement',
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		currencies: [{
			amount: {
				type: Number
			},
			currency: {
				type: CurrencySchema
			},
			type: {
				type: String,
				required: true,
				enum : ['TOTAL', 'PARTIAL', 'MINIMUM'],
				default: 'TOTAL'
			},
		}],
	},
	{ timestamps: false, skipVersioning: { dontVersionMe: true } },
);
