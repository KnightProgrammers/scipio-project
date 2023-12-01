import mongoose from 'mongoose';
import { BankSchema } from "@scipio/models";

export default mongoose.model('Bank', BankSchema);
