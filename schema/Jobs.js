module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Jobs', {
    jobID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lancerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
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
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 2,
      },
    },
    wage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    Duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // optional
    },
  }, {
    tableName: 'jobs',
    schema: 'public',
    timestamps: true,
    freezeTableName: true,
  });

  //return Jobs;
};
