module.exports = (sequelize, DataTypes) => {
    const Attribute = sequelize.define('Attribute', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        meta_title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        meta_description: {
            type: DataTypes.TEXT,
            allowNull: true
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
        tableName: 'tc_attributes',
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            { fields: ['name'], unique: true },
            { fields: ['slug'], unique: true },
            { fields: ['is_active'] },
            { fields: ['deleted_at'] }
        ]
    });

    Attribute.associate = (models) => {
        Attribute.belongsTo(models.User, {
            foreignKey: 'created_by',
            as: 'creator'
        });

        Attribute.belongsTo(models.User, {
            foreignKey: 'updated_by',
            as: 'updater'
        });
    };

    return Attribute;
};
