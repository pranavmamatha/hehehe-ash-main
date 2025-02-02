const User = require('../models/User');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    
    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    console.log("@auth router", JWT_SECRET);
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    
    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);
    
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};
exports.updateTags = async (req, res) => {
  try {
    const { tags } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { tags },
      { new: true }
    );
    res.json({ success: true, tags: user.tags });
  } catch (error) {
    res.status(500).json({ message: 'Error updating tags', error: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, tags: user.tags });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tags', error: error.message });
  }
}; 