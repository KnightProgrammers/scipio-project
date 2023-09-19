import mongoose from 'mongoose';

export const CurrencySchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
});

export default mongoose.model('Currency', CurrencySchema);
