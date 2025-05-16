const { User } = require('../models');

exports.register = async (req, res) => {
  // Handled by Passport Google—redirect here if needed
  res.redirect('/');
};

exports.postProfile = async (req, res) => {
  const user = req.user;
  const { yearsInIndustry, industryField, location } = req.body;
  user.yearsInIndustry = yearsInIndustry;
  user.industryField   = industryField;
  user.location        = location;
  if (req.file) user.cvPath = `/uploads/cvs/${req.file.filename}`;
  await user.save();
  res.redirect('/dashboard/freelancer');
};
