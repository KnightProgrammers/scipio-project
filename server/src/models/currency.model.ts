import mongoose from 'mongoose';
import { CurrencySchema } from "@scipio/models";

export default mongoose.model('Currency', CurrencySchema);
