import mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum : ['NEED', 'WANT', 'SAVE'],
			defaultValue: 'NEED'
		},
		isFixedPayment: {
			type: Boolean,
			defaultValue: false,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		isDeleted: {
			type: Boolean,
			defaultValue: false,
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);

export default mongoose.model('Category', CategorySchema);
