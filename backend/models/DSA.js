const mongoose = require('mongoose');

const dsaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemName: { type: String, required: true, trim: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  platform: {
    type: String,
    enum: ['LeetCode', 'Codeforces', 'HackerRank', 'GeeksForGeeks', 'InterviewBit', 'CodeChef', 'Other'],
    default: 'LeetCode'
  },
  topic: {
    type: String,
    enum: ['Array', 'String', 'LinkedList', 'Stack', 'Queue', 'Tree', 'Graph', 'DP', 'Greedy', 'Backtracking', 'BinarySearch', 'Heap', 'Hashing', 'Trie', 'Segment Tree', 'Math', 'Bit Manipulation', 'Two Pointer', 'Sliding Window', 'Recursion', 'Other'],
    required: true
  },
  problemUrl: { type: String, default: '' },
  solved: { type: Boolean, default: false },
  solvedAt: { type: Date },
  revisionRequired: { type: Boolean, default: false },
  lastRevised: { type: Date },
  timeTaken: { type: Number, default: 0 }, // minutes
  notes: { type: String, default: '' },
  dayNumber: { type: Number }, // which day it was solved
  createdAt: { type: Date, default: Date.now }
});

dsaSchema.index({ user: 1, topic: 1 });
dsaSchema.index({ user: 1, difficulty: 1 });
dsaSchema.index({ user: 1, revisionRequired: 1 });

module.exports = mongoose.model('DSA', dsaSchema);
