import mongoose from 'mongoose';
import { CreditCardSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('CreditCard', CreditCardSchema);
