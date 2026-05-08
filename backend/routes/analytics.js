const express = require('express');
const r = express.Router();
const c = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/summary', c.getSummary);
r.get('/weekly/:weekNum', c.getWeeklyDetail);
module.exports = r;
