import mongoose from 'mongoose';
import { CategorySchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Category', CategorySchema);
