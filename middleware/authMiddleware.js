const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  authenticate: (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Invalid token' });
    }
  },

  authorize: (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: `Access denied. Required roles: ${roles.join(', ')}` 
        });
      }
      next();
    };
  }
};