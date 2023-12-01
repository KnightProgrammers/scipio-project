import mongoose from 'mongoose';
import { CategorySchema } from '@scipio/models';

export default mongoose.model('Category', CategorySchema);
