import mongoose from 'mongoose';
import { CreditCardStatementPaymentSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('CreditCardStatementPayment', CreditCardStatementPaymentSchema);
