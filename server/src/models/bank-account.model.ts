import mongoose from 'mongoose';
import { BankAccountSchema } from '@scipio/models';

export default mongoose.model('BankAccount', BankAccountSchema);
