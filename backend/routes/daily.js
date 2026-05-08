const express = require('express');
const router = express.Router();
const { getAllDaily, createDaily, updateDaily, getToday, getHeatmap, deleteDaily } = require('../controllers/dailyController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/today', getToday);
router.get('/heatmap', getHeatmap);
router.get('/', getAllDaily);
router.post('/', createDaily);
router.put('/:id', updateDaily);
router.delete('/:id', deleteDaily);

module.exports = router;
