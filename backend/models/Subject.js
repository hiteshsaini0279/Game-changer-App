const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  covered: { type: Boolean, default: false },
  revisionStatus: { type: String, enum: ['not_started', 'in_progress', 'done'], default: 'not_started' },
  confidence: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  notes: { type: String, default: '' },
  coveredAt: { type: Date }
});

const subjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, enum: ['OOPS', 'DBMS', 'OS', 'CN'], required: true },
  topics: [topicSchema],
  overallConfidence: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

subjectSchema.index({ user: 1, subject: 1 }, { unique: true });

subjectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Subject', subjectSchema);
