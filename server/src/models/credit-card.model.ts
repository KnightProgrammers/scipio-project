import mongoose from 'mongoose';
import { CreditCardSchema } from "@scipio/models";
export default mongoose.model('CreditCard', CreditCardSchema);
