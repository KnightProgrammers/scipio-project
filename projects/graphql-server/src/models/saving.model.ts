import mongoose from 'mongoose';
import { SavingSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Saving', SavingSchema);
