import mongoose from 'mongoose';
import { UserSchema } from '@scipio/models';

export default mongoose.model('User', UserSchema);
