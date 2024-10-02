const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  imageUrl: { type: String },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }] // Referenced event model
});

const User = mongoose.model('Users', userSchema);

module.exports = User;
