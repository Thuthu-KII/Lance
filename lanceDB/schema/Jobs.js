module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Jobs', {
    jobID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 2,
      },
    },
  }, {
    tableName: 'jobs',
    schema: 'public',
    timestamps: true,
    freezeTableName: true,
  });

  //return Jobs;
};
