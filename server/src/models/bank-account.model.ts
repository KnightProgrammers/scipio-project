import mongoose from "mongoose";
import { CurrencySchema } from "@/models/currency.model";

export const BankAccountSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
    },
    accountBalance: {
        type: Number,
        defaultValue: 0
    },
    accountIsDeleted: {
        type: Boolean,
        defaultValue: false
    },
    accountUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    accountBank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    },
    accountCurrency: CurrencySchema
});

export default mongoose.model('BankAccount', BankAccountSchema);
