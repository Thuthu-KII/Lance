module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    title:       { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT,   allowNull: false },
    wage:        { type: DataTypes.FLOAT,  allowNull: false },
    location:    DataTypes.STRING,
    category:    DataTypes.STRING,
    duration:    DataTypes.STRING,
    status:      { type: DataTypes.ENUM('Open','Closed'), defaultValue: 'Open' }
  });
  return Job;
};
