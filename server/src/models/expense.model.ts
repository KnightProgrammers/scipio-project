import mongoose from 'mongoose';
import { ExpenseSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Expense', ExpenseSchema);
