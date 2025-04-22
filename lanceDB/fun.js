const jobs = require('./schema');
const lancers = require('./lancers-table');
const clients = require('./clients-table');
const sequelize = require('./sequelize');

let name = "George";
let jobtitle = "MongoDB";
let description = "Looking for an experienced guy who loves Mongo like me"
let status = 0;


async function addJob(name,jobTitle,description,status){ //adds a job
    try{
        await sequelize.authenticate();
        console.log("Connection to database established");

        await jobs.sync();

       const newJob = await jobs.create({
            clientName: name,
            jobTitle: jobtitle,
            description:description,
            Status: status

        });

        console.log('Job created successfully.',newJob.toJSON() );


    }catch(err){
        console.log("Job could not be added to the database: " , err);


    }finally{
        await sequelize.close();
        console.log('Conection closed');

    }
}

async function showAvailableJobs(){ //shows all available jobs, returns JSON array that with relevant information
    try{
        await sequelize.authenticate();
        console.log("Connection to database established");
        await jobs.sync();
        const job = await jobs.findAll({attributes:['jobID','clientName','jobTitle','description'],
            where:{
                Status: 0
            }
        });
        const plainjob = job.map(job => job.get({plain: true})); //returns  just the relevant job info that we wanted
        plainjob[status] = 'Still taking applications';
        console.log(plainjob);
    }catch(err){
        console.log("Could not retrieve job details: ", err);

    }finally{
        await sequelize.close();

    }
}

async function showSpecificJob(id){ //shows a specific job, returns a 
    try{
        await sequelize.authenticate();
        console.log("Connection to database established");
        await jobs.sync();
        const job = await jobs.findAll({attributes:['clientName','jobTitle','description'],
            where:{
                jobId: id
            }
        }); //runs a select where a certain condition is met
        console.log(job);
    }catch(err){
        console.log("Could not retrieve job details: ", err);

    }finally{
        await sequelize.close();

    }

}

async function addLancer(id,contact,occ){
        try{
            await sequelize.authenticate();
            await jobs.sync();
            const user = await clients.create({
                lancerId : id,
                contactInfo : contact,
                occuptation: occ
            });
        }catch(e){
            console.log("Error adding user. Please try again. ", e);
        }finally{
            await sequelize.close();

        }
    
}

async function addClient(id,contact){
        try{
            await sequelize.authenticate();
            await jobs.sync();
            const user = await clients.create({
                clientId : id,
                contactInfo : contact
            });
        }catch(e){
            console.log("Error adding user. Please try again. ", e);
        }finally{
            await sequelize.close();
            
        }
    
}

addJob(name,jobtitle,description,status);
showAvailableJobs();




