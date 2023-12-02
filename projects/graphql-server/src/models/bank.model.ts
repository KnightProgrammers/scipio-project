import mongoose from 'mongoose';
import { BankSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Bank', BankSchema);
