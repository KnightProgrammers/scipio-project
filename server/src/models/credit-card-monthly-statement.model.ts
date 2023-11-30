import mongoose from 'mongoose';

export const CreditCardMonthlyStatementSchema = new mongoose.Schema(
	{
		closeDate: {
			type: Date,
			required: true,
		},
		creditCardId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);

export default mongoose.model('CreditCardMonthlyStatement', CreditCardMonthlyStatementSchema);
