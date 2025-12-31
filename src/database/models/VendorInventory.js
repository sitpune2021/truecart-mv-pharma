module.exports = (sequelize, DataTypes) => {
  const VendorInventory = sequelize.define('VendorInventory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_products',
        key: 'id'
      }
    },
    total_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    online_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    offline_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 0
      }
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'tc_vendor_inventory',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['vendor_id'] },
      { fields: ['product_id'] },
      { 
        fields: ['vendor_id', 'product_id'],
        unique: true,
        where: { deleted_at: null }
      },
      { fields: ['total_stock'] },
      { fields: ['online_stock'] }
    ],
    validate: {
      stockAllocationValid() {
        if (this.total_stock !== this.online_stock + this.offline_stock) {
          throw new Error('Total stock must equal online stock plus offline stock');
        }
      }
    }
  });

  VendorInventory.associate = (models) => {
    VendorInventory.belongsTo(models.User, {
      foreignKey: 'vendor_id',
      as: 'vendor'
    });

    VendorInventory.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    VendorInventory.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    VendorInventory.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });

    VendorInventory.hasMany(models.InventoryLog, {
      foreignKey: 'vendor_id',
      as: 'inventoryLogs'
    });
  };

  return VendorInventory;
};
