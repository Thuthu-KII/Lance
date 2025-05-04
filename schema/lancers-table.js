module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Lancers', {
    lancerId: {
      type: DataTypes.STRING,
      primaryKey: true,
      //autoIncrement: true,
    },
    personalInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    stats: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    balance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    reviews: {
      type: DataTypes.JSONB,
      allowNull: true,
    }
  }, {
    tableName: 'lncrs',        // Use lowercase for PostgreSQL
    schema: 'public',            // Explicitly specify schema
    timestamps: true,
    freezeTableName: true        // Prevents Sequelize from pluralizing
  });
};
