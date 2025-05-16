const { Application, Job } = require('../models');
exports.apply = async (req, res) => {
  const freelancerId = req.user.id;
  const { jobId } = req.body;
  await Application.create({
    freelancerId,
    jobId,
    cvPath: `/uploads/cvs/${req.files.cv[0].filename}`,
    policeClearancePath: `/uploads/clearances/${req.files.clearance[0].filename}`
  });
  res.redirect('/freelancer/dashboard');
};

exports.listForJob = async (req, res) => {
  const apps = await Application.findAll({
    where: { jobId: req.params.jobId },
    include: ['freelancer']
  });
  res.render('applications', { applications: apps });
};
