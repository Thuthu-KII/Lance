const { User, Job, Application } = require('../models');
exports.dashboard = async (req, res) => {
  const users = await User.findAll();
  const jobs  = await Job.findAll();
  const disputes = await Application.findAll({ where: { status: 'Dispute' } });
  res.render('adminDashboard', { users, jobs, disputes });
};

exports.activateFreelancer = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  user.role = 'Freelancer';
  await user.save();
  res.redirect('/admin/dashboard');
};
