const DevProject = require('../models/DevProject');

const getAll = async (req, res, next) => {
  try {
    const projects = await DevProject.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, projects });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const project = await DevProject.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const project = await DevProject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await DevProject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { next(err); }
};

const addTask = async (req, res, next) => {
  try {
    const project = await DevProject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $push: { tasks: req.body }, updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const project = await DevProject.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, 'tasks._id': req.params.taskId },
      { $set: { 'tasks.$': req.body }, updatedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, project });
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove, addTask, updateTask };
