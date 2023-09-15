import mongoose from 'mongoose';

export const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

export default mongoose.model('Country', CountrySchema);
