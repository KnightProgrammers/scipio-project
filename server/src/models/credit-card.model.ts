import mongoose from 'mongoose';
import { CurrencySchema } from '@/models/currency.model';

export const BankSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
        },
        cardHolder: {
            type: String,
            required: false,
        },
        lastFourDigits: {
            type: String,
            required: true,
        },
        expiration: {
            type: Date,
            required: true,
        },
        issuer: {
            type: String,
            required: true,
            enum : ['visa', 'mastercard', 'other'],
            default: 'other'
        },
        status: {
            type: String,
            required: true,
            enum : ['ACTIVE', 'EXPIRED', 'BLOCKED'],
            default: 'ACTIVE'
        },
        creditLimitAmount: {
            type: Number,
            defaultValue: 0
        },
        creditLimitCurrency: {
            type: CurrencySchema,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    { timestamps: true, skipVersioning: { dontVersionMe: true } },
);

export default mongoose.model('CreditCard', BankSchema);
