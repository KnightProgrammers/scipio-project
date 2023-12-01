import mongoose from 'mongoose';
import { BudgetCategorySchema } from "@scipio/models";

export default mongoose.model('BudgetCategory', BudgetCategorySchema);
