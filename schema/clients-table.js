module.exports = (sequelize, DataTypes) => {
  return sequelize.define('clients', {
    clientId: {
      type: DataTypes.STRING,
      primaryKey: true,
      //autoIncrement: true,
    },
    personalInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    rating: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    tableName: 'client',        // Use lowercase for PostgreSQL
    schema: 'public',            // Explicitly specify schema
    timestamps: true,
    freezeTableName: true        // Prevents Sequelize from pluralizing
  });
};
