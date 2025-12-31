module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tc_users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tc_roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'tc_user_roles',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['role_id'] },
      { fields: ['expires_at'] }
    ]
  });

  UserRole.associate = (models) => {
    // Associations are handled in User and Role models
  };

  return UserRole;
};
