import mongoose from 'mongoose';
import { CreditCardMonthlyStatementSchema } from '@scipio/models';

export default mongoose.model('CreditCardMonthlyStatement', CreditCardMonthlyStatementSchema);
