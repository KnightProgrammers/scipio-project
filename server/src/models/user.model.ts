import mongoose from 'mongoose';
import { CountrySchema } from "@/models/country.model";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: String,
  lang: String,
  firebaseId: {
    type: String,
    required: true,
    unique: true
  },
  country: CountrySchema
});

export default mongoose.model('User', UserSchema);
