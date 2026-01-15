module.exports = (sequelize, DataTypes) => {
  const ProductSalt = sequelize.define('ProductSalt', {
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
    salt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_salts',
        key: 'id'
      }
    }
  }, {
    tableName: 'tc_product_salts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['product_id', 'salt_id']
      }
    ]
  });

  return ProductSalt;
};
