const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Daily = require('../models/Daily');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// @POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, startDate } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      startDate: startDate ? new Date(startDate) : new Date()
    });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
};

// @POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userObj = user.toJSON();
    res.json({ success: true, token, user: userObj });
  } catch (err) {
    next(err);
  }
};

// @GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, dailyDSATarget, startDate, theme } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (dailyDSATarget) updates.dailyDSATarget = dailyDSATarget;
    if (startDate) updates.startDate = new Date(startDate);
    if (theme) updates.theme = theme;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
