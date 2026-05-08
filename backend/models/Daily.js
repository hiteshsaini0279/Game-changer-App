const mongoose = require('mongoose');

const dailySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  dayNumber: { type: Number, required: true },
  dsaTarget: { type: Number, default: 2 },
  dsaCompleted: { type: Number, default: 0 },
  developmentWork: { type: String, default: '' },
  coreSubject: {
    type: String,
    enum: ['OOPS', 'DBMS', 'OS', 'CN', 'None'],
    default: 'None'
  },
  coreSubjectTopic: { type: String, default: '' },
  englishPractice: { type: Boolean, default: false },
  studyHours: { type: Number, default: 0, min: 0, max: 24 },
  completed: { type: Boolean, default: false },
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad'], default: 'okay' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for user + date uniqueness
dailySchema.index({ user: 1, date: 1 }, { unique: true });
dailySchema.index({ user: 1, dayNumber: 1 });

dailySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  // Auto mark complete if DSA target met and study hours > 0
  if (this.dsaCompleted >= this.dsaTarget && this.studyHours > 0) {
    this.completed = true;
  }
  next();
});

module.exports = mongoose.model('Daily', dailySchema);
