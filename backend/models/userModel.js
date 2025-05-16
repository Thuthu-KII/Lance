module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    googleId:    { type: DataTypes.STRING, unique: true },
    displayName: DataTypes.STRING,
    email:       { type: DataTypes.STRING, unique: true },
    role:        { type: DataTypes.ENUM('Client','Freelancer','Admin'), allowNull: false },
    yearsInIndustry: DataTypes.INTEGER,
    industryField:   DataTypes.STRING,
    location:        DataTypes.STRING,
    cvPath:          DataTypes.STRING
  });
  return User;
};
