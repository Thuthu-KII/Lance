module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Jobs', {
    jobID: {
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
    clientId: {
      type: DataTypes.STRING,
      references: {
        model: 'client',
        key: 'clientId'
      },
      onDelete : 'CASCADE',
      onUpdate: 'CASCADE'
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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Pending',
    },
    wage: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // optional
    },
  }, {
    tableName: 'Job',
    schema: 'public',
    timestamps: true,
    freezeTableName: true,
  });

  //return Jobs;
};
