import mongoose from 'mongoose';

export const CountrySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
		isSupported: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true, skipVersioning: { dontVersionMe: true } },
);
