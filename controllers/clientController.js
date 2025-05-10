const { Jobs } = require('../schema');
const db = require('../schema');
const sequelize = require('../sequelize');

exports.addClient = async (req,res) => {

   const{id, personalInfo, rating} = req.body;

    try {
        //await sequelize.authenticate();
        //await db.Clients.sync();

        const user = await db.client.create({
            clientId: id,
            personalInfo: personalInfo,
            rating: rating
        });

        res.status(201).json(user.toJSON());

       

    } catch (e) {
        res.status(500).json({error: "Could not add client", details: e.message});
    }
}

exports.getProfile = async (req,res) =>{
    const{clientId} = req.query;

    try{
        //console.log('client id is ' , clientId);
        const user = await db.client.findOne({ where: { clientId: clientId } });
        res.status(200).json(user);

    }catch(e){
        res.status(500).json({error: 'could not get profile', message:e.message});
    }
}

exports.updateProfile = async(req,res) =>{
    const{personalInfo,clientId} = req.body;
    try{
        const info = await db.client.update(
            {personalInfo : personalInfo},
            {where : {clientId : clientId}}
        )
        res.status(201).json({message: "Profile successsfully updated"});
    }catch(e){
        res.status(500).json({error : e, details: e.message})
    }

}