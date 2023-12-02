import mongoose from 'mongoose';
import { BudgetCategorySchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('BudgetCategory', BudgetCategorySchema);
