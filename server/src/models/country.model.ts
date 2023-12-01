import mongoose from 'mongoose'
import { CountrySchema } from "@scipio/models";

export default mongoose.model('Country', CountrySchema);
