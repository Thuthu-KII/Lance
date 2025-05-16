module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    cvPath:       DataTypes.STRING,
    policeClearancePath: DataTypes.STRING,
    status:       { type: DataTypes.ENUM('Pending','Shortlisted','Rejected','Hired'), defaultValue: 'Pending' }
  });
  return Application;
};
