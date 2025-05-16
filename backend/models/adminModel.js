module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
    // any extra admin-specific fields
  });
  return Admin;
};
