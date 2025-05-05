const db = require('../schema');
const sequelize = require('../sequelize');

exports.showAvailableJobs = async (req, res) => {
    try {
        //await db.Jobs.sync();
        const jobs = await db.Job.findAll();
        res.status(200).json(jobs.map(j => j.get({ plain: true })));
    } catch (err) {
        console.log("Error adding job:", err); // 🔍 This shows the actual error in the console
        res.status(500).json({ error: 'Failed to add job', details: err.message });
    }
};

exports.addJob = async (req, res) => {
    const { jobId, lancerId, clientId, jobTitle, description,status,wage,duration,accepted } = req.body;
    try {
        //await db.Jobs.sync();
        const job = await db.Job.create({
            //jobId: jobId,
            lancerId : lancerId,
            clientId : clientId,
            jobTitle : jobTitle,
            description: description,
            status : status,
            wage: wage,
            duration: duration,
            accepted: accepted
        });
        res.status(201).json(job.toJSON()); 
    } catch (err) {
        res.status(500).json({ error: 'Failed to add job', details: err.message });
    }
};


exports.updateStatus = async (req, res) => {
    console.log('Received request body:', req.body);
    const { jobID, status } = req.body;
    
    // Log incoming values for debugging
    console.log('Received jobId:', jobID);
    console.log('Received status:', status);

    try {
        console.log()
        const job = await db.Job.update(
            { status: status },  // Fields to update
            { where: { jobID: jobID } }  // WHERE clause
        );
        
        res.status(200).json({ message: "Job status updated" });
    } catch (err) {
        console.error(err); // Helpful for debugging
        res.status(500).json({ error: "Failed to update job status", details: err.message });
    }
};

exports.addApplication = async (req,res) => {
    const{applicationID,lancerID,occupation,CV} = req.query;

    try{
        //await sequelize.authenticate();

        const apply = await db.Application.create({
            //applicationID : applicationID,
            lancerID : lancerID,
            occupation : occupation,
            CV: CV
        });

        res.status(200).json(apply.toJSON());
    }catch(e){
        res.status(500).json({error: 'An error has occured', details: e.message})
    }
};

exports.countApplications = async (req, res) => {
    const { applicationID } = req.query; 
    console.log(applicationID);

    try {
        await sequelize.authenticate();

        // Count the number of records that match the applicationID
        const count = await db.Application.count({
            where: {
                applicationID: applicationID
            }
        });

        // Return the count directly in the response
        res.status(200).json({ count });

    } catch (e) {
        res.status(500).json({ error: 'An error has occured', details: e.message });
    } 
};

