const db = require('../schema');
const sequelize = require('../sequelize');

exports.showAvailableJobs = async (req, res) => {
    try {
        await db.Jobs.sync();
        const jobs = await db.Jobs.findAll({ where: { Status: 0 } });
        res.json(jobs.map(j => j.get({ plain: true })));
    } catch (err) {
        res.status(500).json({ error: 'Could not fetch jobs' });
    }
};

exports.addJob = async (req, res) => {
    const { name, jobTitle, description, status } = req.body;
    try {
        await db.Jobs.sync();
        const job = await db.Jobs.create({
            clientName: name,
            jobTitle,
            description,
            Status: status
        });
        res.status(201).json(job.toJSON());
    } catch (err) {
        res.status(500).json({ error: 'Failed to add job' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id, update } = req.body;
    try {
        await db.Jobs.sync();
        
        const job = await db.Jobs.update(
            { Status: update },          // Fields to update
            { where: { jobId: id } }     // WHERE clause
        );
        
        res.status(200).json({ message: "Job status updated" });
    } catch (err) {
        console.error(err); // Helpful for debugging
        res.status(500).json({ error: "Failed to update job status" });
    }
};
