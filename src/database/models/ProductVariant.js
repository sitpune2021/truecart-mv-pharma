module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_products',
        key: 'id'
      }
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    variant_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    pack_size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('weight');
        return value ? parseFloat(value) : null;
      }
    },
    weight_unit: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'g'
    },
    volume: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('volume');
        return value ? parseFloat(value) : null;
      }
    },
    volume_unit: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: 'ml'
    },
    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    size: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    strength: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    form: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    primary_image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('price');
        return value ? parseFloat(value) : null;
      }
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('cost_price');
        return value ? parseFloat(value) : null;
      }
    },
    mrp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      get() {
        const value = this.getDataValue('mrp');
        return value ? parseFloat(value) : null;
      }
    },
    attributes: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'tc_product_variants',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['sku'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['is_active'] },
      { fields: ['is_default'] },
      { fields: ['deleted_at'] }
    ]
  });

  ProductVariant.associate = (models) => {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });

    ProductVariant.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    ProductVariant.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return ProductVariant;
};
