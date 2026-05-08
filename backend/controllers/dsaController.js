const DSA = require('../models/DSA');

// @GET /api/dsa
const getAll = async (req, res, next) => {
  try {
    const { topic, difficulty, platform, revisionRequired, solved, search } = req.query;
    const filter = { user: req.user._id };
    
    if (topic) filter.topic = topic;
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.platform = platform;
    if (revisionRequired !== undefined) filter.revisionRequired = revisionRequired === 'true';
    if (solved !== undefined) filter.solved = solved === 'true';
    if (search) filter.problemName = { $regex: search, $options: 'i' };

    const problems = await DSA.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, problems, total: problems.length });
  } catch (err) {
    next(err);
  }
};

// @POST /api/dsa
const create = async (req, res, next) => {
  try {
    const problem = await DSA.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, problem });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/dsa/:id
const update = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.solved && !updates.solvedAt) updates.solvedAt = new Date();
    
    const problem = await DSA.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, problem });
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/dsa/:id
const remove = async (req, res, next) => {
  try {
    const problem = await DSA.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (err) {
    next(err);
  }
};

// @GET /api/dsa/stats
const getStats = async (req, res, next) => {
  try {
    const stats = await DSA.aggregate([
      { $match: { user: req.user._id, solved: true } },
      {
        $group: {
          _id: { topic: '$topic', difficulty: '$difficulty' },
          count: { $sum: 1 }
        }
      }
    ]);

    const topicStats = await DSA.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$topic',
          total: { $sum: 1 },
          solved: { $sum: { $cond: ['$solved', 1, 0] } }
        }
      },
      { $sort: { solved: -1 } }
    ]);

    const difficultyStats = await DSA.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$difficulty',
          total: { $sum: 1 },
          solved: { $sum: { $cond: ['$solved', 1, 0] } }
        }
      }
    ]);

    const revisionQueue = await DSA.find({ user: req.user._id, revisionRequired: true, solved: true })
      .sort({ lastRevised: 1 })
      .limit(10);

    res.json({ success: true, stats, topicStats, difficultyStats, revisionQueue });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove, getStats };
