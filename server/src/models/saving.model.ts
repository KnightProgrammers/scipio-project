import mongoose from 'mongoose';

export const SavingSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		targetAmount: {
			type: Number,
			required: true,
		},
		targetDate: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum : ['IN_PROGRESS','COMPLETED','NOT_CONCLUDED','EXPIRED'],
			defaultValue: 'IN_PROGRESS'
		},
		bankAccountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'BankAccount',
		},
		currencyId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Currency',
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);

export default mongoose.model('Saving', SavingSchema);
