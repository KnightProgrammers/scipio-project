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
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);

export default mongoose.model('Expense', ExpenseSchema);
