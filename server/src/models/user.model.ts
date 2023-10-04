import mongoose from 'mongoose'
import { CountrySchema } from '@/models/country.model'
import { CurrencySchema } from '@/models/currency.model'

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        avatar: String,
        lang: String,
        firebaseId: {
            type: String,
            required: true,
            unique: true,
        },
        country: CountrySchema,
        currencies: [CurrencySchema],
    },
    { timestamps: true, skipVersioning: { dontVersionMe: true } },
)

export default mongoose.model('User', UserSchema)
