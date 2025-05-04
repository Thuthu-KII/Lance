//const { Jobs } = require('../schema');
const db = require('../schema');
const sequelize = require('../sequelize');

exports.countApplications = async (req, res) => {
    const { applicationID } = req.body; 
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
    } finally {
        await sequelize.close();
    }
};
