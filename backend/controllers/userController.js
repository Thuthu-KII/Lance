// Example of any user-related actions
const { addJob } = require('../models/jobModel');

exports.postJob = (req, res) => {
  const { jobTitle, jobDescription, wage, ClientID } = req.body;
//console.log(ClientID,jobTitle,jobDescription,wage);
  try {
    addJob.run({ 
        clientId: ClientID,
      title: jobTitle, 
      description: jobDescription, 
      wage: wage
    });
    console.log("Sdfsdfs");
    res.json({ message: 'Job posted successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post job' });
  }
};
