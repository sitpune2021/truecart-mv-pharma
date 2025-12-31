module.exports = (sequelize, DataTypes) => {
  const InventoryLog = sequelize.define('InventoryLog', {
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
    transaction_type: {
      type: DataTypes.ENUM(
        'restock',
        'sale',
        'offline_sale',
        'adjustment',
        'allocation_change',
        'damage',
        'return',
        'transfer'
      ),
      allowNull: false
    },
    quantity_change: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    stock_type: {
      type: DataTypes.ENUM('total', 'online', 'offline'),
      allowNull: false,
      defaultValue: 'total'
    },
    previous_total_stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    new_total_stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    previous_online_stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    new_online_stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    previous_offline_stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    new_offline_stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    performed_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tc_inventory_logs',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
    paranoid: false,
    indexes: [
      { fields: ['vendor_id'] },
      { fields: ['product_id'] },
      { fields: ['vendor_id', 'product_id'] },
      { fields: ['transaction_type'] },
      { fields: ['reference_type', 'reference_id'] },
      { fields: ['created_at'] },
      { fields: ['performed_by'] }
    ]
  });

  InventoryLog.associate = (models) => {
    InventoryLog.belongsTo(models.User, {
      foreignKey: 'vendor_id',
      as: 'vendor'
    });

    InventoryLog.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    InventoryLog.belongsTo(models.User, {
      foreignKey: 'performed_by',
      as: 'performer'
    });
  };

  return InventoryLog;
};
