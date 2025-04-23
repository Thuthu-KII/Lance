const { Jobs } = require('../schema');
const db = require('../schema');
const sequelize = require('../sequelize');

exports.addClient = async (req,res) => {

   const{id, contact} = req.body;

    try {
        await sequelize.authenticate();
        await db.Clients.sync();

        const user = await db.Clients.create({
            clientId: id,
            contactInfo: contact
        });

        res.status(201).json(user.toJSON());

       

    } catch (e) {
        res.status(500).json({error: "Could not add client"});
    }
}