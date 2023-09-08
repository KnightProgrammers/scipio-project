import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: String,
  lang: String,
  firebaseId: {
    type: String,
    required: true
  }
});

export default mongoose.model('User', userSchema);
