const db = require('../schema');
const sequelize = require('../sequelize');


exports.removeClient = async (req,res) => {
    const {clientId} = req.body;

    try{
        const client = db.client.destroy({
            where:{
                clientId : clientId
            }
        })

        res.status(200).json({message: 'User succesfully removed'})

    }catch(e){
        res.status(500).json({message: ' Error removing user', details: e.message})

    }
    
}

exports.removeLancer = async (req,res) => {
    const {lancerId} = req.body;

    try{
        const lncr = db.lncrs.destroy({
            where:{
                lancerId : lancerId
            }
        })

        res.status(200).json({message: 'User succesfully removed'})

    }catch(e){
        res.status(500).json({message: ' Error removing user', details: e.message})

    }
    
}