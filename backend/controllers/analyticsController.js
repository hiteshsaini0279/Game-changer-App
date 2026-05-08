const Daily = require('../models/Daily');
const DSA = require('../models/DSA');
const User = require('../models/User');

// @GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const allEntries = await Daily.find({ user: req.user._id }).sort({ date: 1 });

    const completedDays = allEntries.filter(e => e.completed).length;
    const totalHours = allEntries.reduce((sum, e) => sum + (e.studyHours || 0), 0);
    const totalDSA = allEntries.reduce((sum, e) => sum + (e.dsaCompleted || 0), 0);
    const consistencyScore = Math.round((completedDays / 180) * 100);

    // Streak calculation
    const completedDates = allEntries
      .filter(e => e.completed)
      .map(e => new Date(e.date).toDateString())
      .sort((a, b) => new Date(a) - new Date(b));

    let currentStreak = 0, longestStreak = 0, tempStreak = 0;
    for (let i = 0; i < completedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = (new Date(completedDates[i]) - new Date(completedDates[i - 1])) / 86400000;
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastCompleted = completedDates[completedDates.length - 1];
    
    if (lastCompleted === today || lastCompleted === yesterday) {
      let streak = 0;
      let checkDate = new Date(lastCompleted);
      for (let i = completedDates.length - 1; i >= 0; i--) {
        if (completedDates[i] === checkDate.toDateString()) {
          streak++;
          checkDate = new Date(checkDate.getTime() - 86400000);
        } else break;
      }
      currentStreak = streak;
    }

    // Days since start
    const daysSinceStart = Math.floor((Date.now() - new Date(user.startDate)) / 86400000) + 1;
    const daysRemaining = Math.max(0, 180 - daysSinceStart);

    // Projection
    const avgDSAPerDay = daysSinceStart > 0 ? totalDSA / daysSinceStart : 0;
    const projectedDSA = Math.round(totalDSA + (avgDSAPerDay * daysRemaining));

    // Weekly data (last 8 weeks)
    const weeklyData = [];
    for (let w = 0; w < 8; w++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (w * 7) - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      
      const weekEntries = allEntries.filter(e => {
        const d = new Date(e.date);
        return d >= weekStart && d < weekEnd;
      });
      
      weeklyData.unshift({
        week: `W${8 - w}`,
        completed: weekEntries.filter(e => e.completed).length,
        hours: parseFloat(weekEntries.reduce((s, e) => s + (e.studyHours || 0), 0).toFixed(1)),
        dsa: weekEntries.reduce((s, e) => s + (e.dsaCompleted || 0), 0)
      });
    }

    res.json({
      success: true,
      summary: {
        completedDays,
        totalDays: 180,
        daysSinceStart,
        daysRemaining,
        totalHours: parseFloat(totalHours.toFixed(1)),
        totalDSA,
        consistencyScore,
        currentStreak,
        longestStreak,
        projectedDSA,
        avgDSAPerDay: parseFloat(avgDSAPerDay.toFixed(1)),
        avgHoursPerDay: daysSinceStart > 0 ? parseFloat((totalHours / daysSinceStart).toFixed(1)) : 0,
        startDate: user.startDate
      },
      weeklyData
    });
  } catch (err) {
    next(err);
  }
};

// @GET /api/analytics/weekly/:weekNum
const getWeeklyDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const weekNum = parseInt(req.params.weekNum);
    const startDate = new Date(user.startDate);
    
    const weekStart = new Date(startDate.getTime() + (weekNum - 1) * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);

    const entries = await Daily.find({
      user: req.user._id,
      date: { $gte: weekStart, $lt: weekEnd }
    }).sort({ date: 1 });

    const stats = {
      totalDSA: entries.reduce((s, e) => s + (e.dsaCompleted || 0), 0),
      totalHours: entries.reduce((s, e) => s + (e.studyHours || 0), 0),
      completedDays: entries.filter(e => e.completed).length,
      consistency: Math.round((entries.filter(e => e.completed).length / 7) * 100)
    };

    res.json({ success: true, entries, stats, weekNum });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getWeeklyDetail };
