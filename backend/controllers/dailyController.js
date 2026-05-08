const Daily = require('../models/Daily');
const User = require('../models/User');

// Helper: calculate day number from start date
const getDayNumber = (startDate, targetDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.floor((target - start) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

// Helper: calculate streaks
const calculateStreaks = (entries) => {
  if (!entries.length) return { currentStreak: 0, longestStreak: 0 };
  
  const sortedDates = entries
    .filter(e => e.completed)
    .map(e => new Date(e.date).toDateString())
    .sort((a, b) => new Date(a) - new Date(b));

  let currentStreak = 0, longestStreak = 0, tempStreak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr - prev) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak: check if last completed day was today or yesterday
  const lastCompleted = sortedDates[sortedDates.length - 1];
  if (lastCompleted === today || lastCompleted === yesterday) {
    // Walk backwards
    let streak = 0;
    let checkDate = new Date();
    if (lastCompleted === yesterday) checkDate = new Date(Date.now() - 86400000);
    checkDate.setHours(0, 0, 0, 0);
    
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (sortedDates[i] === checkDate.toDateString()) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
    currentStreak = streak;
  }

  return { currentStreak, longestStreak };
};

// @GET /api/daily
const getAllDaily = async (req, res, next) => {
  try {
    const { limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const entries = await Daily.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Daily.countDocuments({ user: req.user._id });
    const allEntries = await Daily.find({ user: req.user._id }).sort({ date: 1 });
    const streaks = calculateStreaks(allEntries);

    res.json({ success: true, entries, total, ...streaks });
  } catch (err) {
    next(err);
  }
};

// @POST /api/daily
const createDaily = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const date = req.body.date ? new Date(req.body.date) : new Date();
    date.setHours(0, 0, 0, 0);
    
    const dayNumber = getDayNumber(user.startDate, date);
    
    const existing = await Daily.findOne({
      user: req.user._id,
      date: { $gte: date, $lt: new Date(date.getTime() + 86400000) }
    });
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Entry for this date already exists. Use PUT to update.' });
    }

    const entry = await Daily.create({
      ...req.body,
      user: req.user._id,
      date,
      dayNumber,
      dsaTarget: req.body.dsaTarget || user.dailyDSATarget
    });

    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/daily/:id
const updateDaily = async (req, res, next) => {
  try {
    const entry = await Daily.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, entry });
  } catch (err) {
    next(err);
  }
};

// @GET /api/daily/today
const getToday = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    
    let entry = await Daily.findOne({ user: req.user._id, date: { $gte: today, $lt: tomorrow } });
    const user = await User.findById(req.user._id);
    const dayNumber = getDayNumber(user.startDate, today);
    
    if (!entry) {
      // Return a template for today
      return res.json({ success: true, entry: null, dayNumber, dsaTarget: user.dailyDSATarget });
    }
    res.json({ success: true, entry, dayNumber });
  } catch (err) {
    next(err);
  }
};

// @GET /api/daily/heatmap
const getHeatmap = async (req, res, next) => {
  try {
    const entries = await Daily.find({ user: req.user._id })
      .select('date completed dsaCompleted studyHours')
      .sort({ date: 1 });
    
    const heatmap = entries.map(e => ({
      date: e.date,
      completed: e.completed,
      dsaCompleted: e.dsaCompleted,
      studyHours: e.studyHours,
      intensity: e.completed ? (e.studyHours >= 6 ? 4 : e.studyHours >= 4 ? 3 : e.studyHours >= 2 ? 2 : 1) : 0
    }));
    
    res.json({ success: true, heatmap });
  } catch (err) {
    next(err);
  }
};

// @DELETE /api/daily/:id
const deleteDaily = async (req, res, next) => {
  try {
    const entry = await Daily.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDaily, createDaily, updateDaily, getToday, getHeatmap, deleteDaily };
