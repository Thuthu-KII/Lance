module.exports = (sequelize, DataTypes) => {
    return Applications = sequelize.define('applications', {
      applicationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      freelancerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      tableName: 'applications',
      schema: 'public',
      timestamps: true,
      freezeTableName: true,
    });
  
    //return Applications;
  };
  