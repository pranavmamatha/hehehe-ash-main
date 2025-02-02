const jwt = require('jsonwebtoken');
const User = require('../models/User');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("toek",token);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log("token",JWT_SECRET);
    

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    // console.log(user);
        
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth;