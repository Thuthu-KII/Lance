module.exports = (sequelize, DataTypes) => {
    return sequelize.define('payments', {
        transactionId: {
            type: DataTypes.INTEGER,
            allowNull : true,
            primaryKey: true,
            allowNull: false,
            // Removed autoIncrement since it's invalid for STRING
        },
        jobId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Job',
                key: 'jobID'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        Price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    }, {
        tableName: 'payments',
        schema: 'public',
        timestamps: true,
        freezeTableName: true,
    });
};
