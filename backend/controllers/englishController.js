const English = require('../models/English');

const getAll = async (req, res, next) => {
  try {
    const entries = await English.find({ user: req.user._id }).sort({ date: -1 });
    res.json({ success: true, entries });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const entry = await English.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, entry });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const entry = await English.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    res.json({ success: true, entry });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await English.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
