const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

const devProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  techStack: [{ type: String }],
  status: { type: String, enum: ['planning', 'inprogress', 'completed', 'paused'], default: 'planning' },
  tasks: [taskSchema],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  thumbnail: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

devProjectSchema.virtual('progress').get(function () {
  if (!this.tasks || this.tasks.length === 0) return 0;
  const done = this.tasks.filter(t => t.status === 'done').length;
  return Math.round((done / this.tasks.length) * 100);
});

devProjectSchema.set('toJSON', { virtuals: true });

devProjectSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.tasks.every(t => t.status === 'done') && this.tasks.length > 0) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('DevProject', devProjectSchema);
