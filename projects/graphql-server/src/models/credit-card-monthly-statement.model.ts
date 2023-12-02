import mongoose from 'mongoose';
import { CreditCardMonthlyStatementSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('CreditCardMonthlyStatement', CreditCardMonthlyStatementSchema);
