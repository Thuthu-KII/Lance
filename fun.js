const db = require('./schema'); // This gives access to all models
const sequelize = require('./sequelize'); // Sequelize instance

let name = "Georgess";
let jobtitle = "MongoDB";
let description = "Looking for an experienced guy who loves Mongo like me";
let status = 0;

async function addJob(name, jobTitle, description, status) {
    try {
        await sequelize.authenticate();
        console.log("Connection to database established");

        await db.Jobs.sync();

        const newJob = await db.Jobs.create({
            clientName: name,
            jobTitle: jobTitle,
            description: description,
            Status: status
        });

        console.log('Job created successfully.', newJob.toJSON());

    } catch (err) {
        console.log("Job could not be added to the database:", err);
    } finally {
        await sequelize.close();
        console.log('Connection closed');
    }
}

async function showAvailableJobs() {
    try {
        await sequelize.authenticate();
        console.log("Connection to database established");
        await db.Jobs.sync();

        const jobs = await db.Jobs.findAll({
            attributes: ['jobID', 'clientName', 'jobTitle', 'description'],
            where: {
                Status: 0
            }
        });

        const plainJobs = jobs.map(job => job.get({ plain: true }));
        console.log(plainJobs); // return jobs as json

    } catch (err) {
        console.log("Could not retrieve job details:", err);
    } finally {
        await sequelize.close();
    }
}

async function showSpecificJob(id) {
    try {
        await sequelize.authenticate();
        console.log("Connection to database established");
        await db.Jobs.sync();

        const job = await db.Jobs.findOne({
            attributes: ['clientName', 'jobTitle', 'description'],
            where: { jobID: id }
        });

        console.log(job?.get({ plain: true }) || "Job not found");

    } catch (err) {
        console.log("Could not retrieve job details:", err);
    } finally {
        await sequelize.close();
    }
}

async function addLancer(id, contact, occ) {
    try {
        await sequelize.authenticate();
        await db.Lancers.sync();

        const user = await db.Lancers.create({
            lancerId: id,
            contactInfo: contact,
            occupation: occ
        });

        console.log("Lancer added:", user.toJSON());

    } catch (e) {
        console.log("Error adding user. Please try again:", e);
    } finally {
        await sequelize.close();
    }
}

async function addClient(id, contact) {
    try {
        await sequelize.authenticate();
        await db.Clients.sync();

        const user = await db.Clients.create({
            clientId: id,
            contactInfo: contact
        });

        console.log("Client added:", user.toJSON());

    } catch (e) {
        console.log("Error adding user. Please try again:", e);
    } finally {
        await sequelize.close();
    }
}

//addJob(name, jobtitle, description, status);