import mongoose from 'mongoose';

export const BudgetSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		}
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
