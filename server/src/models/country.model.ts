import mongoose from 'mongoose';
import { CountrySchema } from '@knightprogrammers/scpio-db-schemas';

export default mongoose.model('Country', CountrySchema);
