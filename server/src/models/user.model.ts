import mongoose from 'mongoose';
import { UserSchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('User', UserSchema);
