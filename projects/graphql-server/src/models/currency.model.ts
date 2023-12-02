import mongoose from 'mongoose';
import { CurrencySchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Currency', CurrencySchema);
