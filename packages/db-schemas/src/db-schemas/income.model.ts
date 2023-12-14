import mongoose from 'mongoose';

export const IncomeSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true
		},
		incomeDate: {
			type: Date,
			required: true,
		},
		description: {
			type: String,
			required: false,
		},
		currencyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Currency',
			required: true
		},
		bankAccountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'BankAccount',
			required: true
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
