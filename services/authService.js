const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        isAdmin: user.is_admin
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  },

  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
};