module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clients', {
    clientId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    contactInfo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'clients',        // Use lowercase for PostgreSQL
    schema: 'public',            // Explicitly specify schema
    timestamps: true,
    freezeTableName: true        // Prevents Sequelize from pluralizing
  });
};
