module.exports = (sequelize, DataTypes) => {
  const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
    token: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_password_reset_tokens',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token'] },
      { fields: ['expires_at'] }
    ]
  });

  PasswordResetToken.associate = (models) => {
    PasswordResetToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return PasswordResetToken;
};
