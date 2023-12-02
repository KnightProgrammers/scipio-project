import mongoose from 'mongoose';
import { BankAccountSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('BankAccount', BankAccountSchema);
