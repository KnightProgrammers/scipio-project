import mongoose from 'mongoose';
import { BudgetSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Budget', BudgetSchema);
