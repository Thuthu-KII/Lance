module.exports = (sequelize, DataTypes) => {
    return admin = sequelize.define('admin', {
      adminId: {
        type: DataTypes.STRING,
        primaryKey : true,
        onDelete : 'CASCADE',
        onUpdate: 'CASCADE'
      },
    }, {
      tableName: 'admin',
      schema: 'public',
      timestamps: true,
      freezeTableName: true,
    });
  
    //return Applications;
  };
  