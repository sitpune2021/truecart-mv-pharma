module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    product_name_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_product_names',
        key: 'id'
      }
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_brands',
        key: 'id'
      }
    },
    manufacturer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_manufacturers',
        key: 'id'
      }
    },
    supplier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_suppliers',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_categories',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const value = this.getDataValue('price');
        return value ? parseFloat(value) : 0;
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
    stock_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    unit: {
      type: DataTypes.STRING(50),
      allowNull: true
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
    dimensions: {
      type: DataTypes.JSONB,
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
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_best_seller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_offer: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    requires_prescription: {
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
    meta_keywords: {
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
    tableName: 'tc_products',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['sku'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['name'] },
      { fields: ['product_name_id'] },
      { fields: ['brand_id'] },
      { fields: ['manufacturer_id'] },
      { fields: ['supplier_id'] },
      { fields: ['category_id'] },
      { fields: ['category'] },
      { fields: ['brand'] },
      { fields: ['is_active'] },
      { fields: ['is_featured'] },
      { fields: ['is_best_seller'] },
      { fields: ['is_offer'] },
      { fields: ['requires_prescription'] },
      { fields: ['created_at'] },
      { fields: ['deleted_at'] }
    ]
  });

  Product.associate = (models) => {
    Product.belongsTo(models.ProductName, {
      foreignKey: 'product_name_id',
      as: 'productName'
    });

    Product.belongsTo(models.Brand, {
      foreignKey: 'brand_id',
      as: 'brandDetails'
    });

    Product.belongsTo(models.Manufacturer, {
      foreignKey: 'manufacturer_id',
      as: 'manufacturerDetails'
    });

    Product.belongsTo(models.Supplier, {
      foreignKey: 'supplier_id',
      as: 'supplierDetails'
    });

    Product.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'categoryDetails'
    });

    Product.hasMany(models.ProductVariant, {
      foreignKey: 'product_id',
      as: 'variants'
    });

    Product.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
    
    Product.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Product;
};
