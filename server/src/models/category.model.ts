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
			default: 'NEED'
		},
		isFixedPayment: {
			type: Boolean,
			default: false,
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

export default mongoose.model('Category', CategorySchema);
