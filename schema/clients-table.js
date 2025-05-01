module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clients', {
    clientId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    personalInfo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rating: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    tableName: 'clients',        // Use lowercase for PostgreSQL
    schema: 'public',            // Explicitly specify schema
    timestamps: true,
    freezeTableName: true        // Prevents Sequelize from pluralizing
  });
};
