// routes/dsa.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/dsaController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/stats', c.getStats);
r.get('/', c.getAll);
r.post('/', c.create);
r.put('/:id', c.update);
r.delete('/:id', c.remove);
module.exports = r;
