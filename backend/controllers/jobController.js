const { Job } = require('../models');

exports.postJob = async (req, res) => {
  const clientId = req.user.id;
  const { title, description, wage, location, category, duration } = req.body;
  await Job.create({ clientId, title, description, wage, location, category, duration });
  res.redirect('/client/dashboard');
};

exports.listAll = async (req, res) => {
  const jobs = await Job.findAll({ include: 'client' });
  res.render('jobsList', { jobs });
};
