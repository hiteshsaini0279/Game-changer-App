const mongoose = require('mongoose');

const englishSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  topic: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['Speaking', 'Writing', 'Reading', 'Listening', 'Vocabulary', 'Grammar'],
    default: 'Speaking'
  },
  duration: { type: Number, default: 0 }, // minutes
  mistakes: [{ type: String }],
  improvedSentences: [{ wrong: String, correct: String }],
  newWords: [{ word: String, meaning: String }],
  selfRating: { type: Number, min: 1, max: 5, default: 3 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

englishSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('English', englishSchema);
