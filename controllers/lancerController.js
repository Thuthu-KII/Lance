const { Jobs } = require('../schema');
const db = require('../schema');
const sequelize = require('../sequelize');

// Add Lancer
exports.addLancer = async (req, res) => {
    const { userName,lancerId, personalInfo, skills, stats, reviews, balance, rating } = req.body;

    try {
        // Check if lancer already exists
        const existingLancer = await db.lncrs.findOne({ where: { lancerId: lancerId } });

        if (existingLancer) {
            return res.status(409).json({
                error: 'Lancer already exists with this ID.'
            });
        }

        // Create new lancer
        const user = await db.lncrs.create({
            lancerId,
            personalInfo,
            userName, 
            skills,
            stats,
            reviews,
            balance,
            rating
        });

        res.status(201).json(user.toJSON());

    } catch (e) {
        res.status(500).json({
            error: 'Could not add Lancer',
            details: e.message
        });
    }
};


//adding get function.
exports.getLancerByGoogleId = async (req, res) => {
    const { googleId } = req.query;
    

    if (!googleId) {
        return res.status(400).json({ error: 'Missing googleId parameter.' });
    }
    console.log('Google ID is, ' , googleId);

    try {
        const user = await db.lncrs.findOne({ where: { lancerId: googleId } });

        if (!user) {
            return res.status(404).json({ error: 'Lancer not found.' });
        }

        return res.status(200).json(user);
    } catch (e) {
        console.error('Error fetching lancer by Google ID:', e);
        return res.status(500).json({ error: 'Internal Server Error', details: e.message });
    }
};

exports.updateProfile = async(req,res) =>{
    const{personalInfo,lancerId,skills} = req.body;
    try{
        const info = await db.client.update(
            {personalInfo : personalInfo,
                skills: skills
            },
            {where : {lancerId : lancerId}}
        )
        res.status(201).json({message: "Profile successsfully updated"});
    }catch(e){
        res.status(500).json({error : e, details: e.message})
    }

}
