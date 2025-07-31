const jwt = require('jsonwebtoken');
const { AdminUser } = require('../models');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findByPk(decoded.id);
    
    if (!admin || admin.status !== 'active') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { authenticateAdmin };
