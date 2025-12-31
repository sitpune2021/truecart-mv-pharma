module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    token_family: {
      type: DataTypes.UUID,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    revoked_reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_refresh_tokens',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token_hash'], unique: true },
      { fields: ['token_family'] },
      { fields: ['expires_at'] }
    ]
  });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return RefreshToken;
};
