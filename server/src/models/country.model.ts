import mongoose from 'mongoose';

export const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isSupported: {
    type: Boolean,
    defaultValue: false
  }
});

export default mongoose.model('Country', CountrySchema);
