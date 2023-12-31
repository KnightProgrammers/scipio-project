import mongoose from 'mongoose';

export const ExpenseSchema = new mongoose.Schema(
	{
		amount: {
			type: Number,
			required: true,
		},
		billableDate: {
			type: Date,
			required: true,
		},
		description: {
			type: String,
			required: false,
		},
		type: {
			type: String,
			required: true,
			enum : ['CASH', 'CREDIT_CARD', 'BANK_ACCOUNT'],
			default: 'CASH'
		},
		currencyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Currency',
		},
		categoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		creditCardId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CreditCard',
		},
		bankAccountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'BankAccount',
		},
		creditCardMonthlyStatementId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'CreditCardMonthlyStatement',
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
