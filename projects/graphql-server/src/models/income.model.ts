import mongoose from 'mongoose';
import { IncomeSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Income', IncomeSchema);
