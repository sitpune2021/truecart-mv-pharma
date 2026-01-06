module.exports = (sequelize, DataTypes) => {
    const GST = sequelize.define('GST', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        value: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            unique: true,
            get() {
                const value = this.getDataValue('value');
                return value ? parseFloat(value) : null;
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tc_users',
                key: 'id'
            }
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tc_users',
                key: 'id'
            }
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tc_users',
                key: 'id'
            }
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'tc_gst',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            { fields: ['value'], unique: true },
            { fields: ['is_active'] },
            { fields: ['deleted_at'] }
        ]
    });

    GST.associate = (models) => {
        GST.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });

        GST.belongsTo(models.User, {
            foreignKey: 'updated_by',
            as: 'updater'
        });
    };

    return GST;
};
