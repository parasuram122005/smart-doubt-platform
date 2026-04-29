const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      return next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route` });
    }
    next();
  };
};

// Middleware to check if user is verified before performing privileged actions
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  // Admins are always verified
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({ 
      success: false,
      message: 'Your account is under verification. Please wait for admin approval before performing this action.',
      verificationStatus: req.user.verificationStatus
    });
  }
  next();
};

module.exports = { protect, authorize, requireVerified };
