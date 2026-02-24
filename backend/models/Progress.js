const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: String,
  activities: [String],
  notes: String,

  // ⭐ NEW FIELD
  streak: {
    type: Number,
    default: 1
  }

}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);