const { Jobs } = require('../schema');
const db = require('../schema');
const sequelize = require('../sequelize');

exports.addLancer = async (req,res) => {

   const{id, contact, occ} = req.body; 
    try {
        await sequelize.authenticate();
        await db.Lancers.sync();

        const user = await db.Lancers.create({
            lancerId: id,
            contactInfo: contact,
            occupation: occ
        });

        //console.log("Lancer added:", user.toJSON());
        res.status(201).json(user.toJSON());

    } catch (e) {
        //console.log("Error adding user. Please try again:", e);
        res.status(500).json({error: 'Could not add Lancer'});
    } finally {
        await sequelize.close();
    }
}