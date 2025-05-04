const { Jobs } = require('../schema');
const db = require('../schema');
const sequelize = require('../sequelize');

exports.addLancer = async (req,res) => {

   const{lancerId, personalInfo, skills,stats,reviews,balance,rating} = req.body; 
    try {
        //await sequelize.authenticate();
        //await db.lncrs.sync();

        const user = await db.lncrs.create({
            lancerId: lancerId,
            personalInfo: personalInfo,
            skills: skills,
            stats: stats,
            balance: balance,
            rating: rating,
            reviews: reviews
           
        });

        //console.log("Lancer added:", user.toJSON());
        res.status(201).json(user.toJSON());

    } catch (e) {
        //console.log("Error adding user. Please try again:", e);
        res.status(500).json({error: 'Could not add Lancer', details: e.message});
    }
}

exports.getProfile = async (req,res) =>{
    const{lancerId} = req.body;

    try{
        const user = await db.lncrs.findOne({ where: { lancerId: lancerId } });
        res.status(200).json(user);

    }catch(e){
        res.status(500).json({error: 'could not get profile', message:e.message});
    }
}
