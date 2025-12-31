module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
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
    logo_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    manufacturer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_manufacturers',
        key: 'id'
      }
    },
    brand_type: {
      type: DataTypes.ENUM(
        'private_label',
        'fmcg_otc',
        'ayurvedic',
        'herbal_supplement',
        'dermatology',
        'baby_care',
        'generic',
        'other'
      ),
      allowNull: true,
      defaultValue: 'other'
    },
    category: {
      type: DataTypes.STRING(100),
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
    tableName: 'tc_brands',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['slug'], unique: true },
      { fields: ['manufacturer_id'] },
      { fields: ['brand_type'] },
      { fields: ['category'] },
      { fields: ['is_active'] },
      { fields: ['deleted_at'] }
    ]
  });

  Brand.associate = (models) => {
    Brand.belongsTo(models.Manufacturer, {
      foreignKey: 'manufacturer_id',
      as: 'manufacturer'
    });

    Brand.hasMany(models.Product, {
      foreignKey: 'brand_id',
      as: 'products'
    });

    Brand.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    Brand.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return Brand;
};
