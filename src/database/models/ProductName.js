module.exports = (sequelize, DataTypes) => {
  const ProductName = sequelize.define('ProductName', {
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
    uses: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    side_effects: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    precautions: {
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
    tableName: 'tc_product_names',
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

  ProductName.associate = (models) => {
    ProductName.hasMany(models.Product, {
      foreignKey: 'product_name_id',
      as: 'products'
    });

    ProductName.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    ProductName.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return ProductName;
};
