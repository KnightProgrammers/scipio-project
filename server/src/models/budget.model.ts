import mongoose from 'mongoose';
import { BudgetSchema } from "@scipio/models";
export default mongoose.model('Budget', BudgetSchema);
