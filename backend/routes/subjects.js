const express = require('express');
const r = express.Router();
const c = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/', c.getAll);
r.put('/:id', c.updateSubject);
r.put('/:id/topics/:topicId', c.updateTopic);
module.exports = r;
