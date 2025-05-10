module.exports = (sequelize, DataTypes) => {
    return Applications = sequelize.define('applications', {
      applicationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lancerID: {
        type: DataTypes.STRING,
        references: {
          model: 'lncrs',
          key: 'lancerId'
        },
        onDelete : 'CASCADE',
        onUpdate: 'CASCADE'
      },
      jobID : {
        type: DataTypes.INTEGER,
        references: {
          model: 'Job',
          key: 'jobID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      occupation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      CV: {
        type: DataTypes.STRING,
        allowNull: true, // URL to CV
      },
    }, {
      tableName: 'Application',
      schema: 'public',
      timestamps: true,
      freezeTableName: true,
    });
  
    //return Applications;
  };
  