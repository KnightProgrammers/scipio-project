import mongoose from 'mongoose';
import { ExpenseSchema } from "@scipio/models";

export default mongoose.model('Expense', ExpenseSchema);
