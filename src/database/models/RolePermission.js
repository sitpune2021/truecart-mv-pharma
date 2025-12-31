module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
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
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'tc_permissions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    granted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    granted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_role_permissions',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['role_id'] },
      { fields: ['permission_id'] }
    ]
  });

  RolePermission.associate = (models) => {
    // Associations are handled in Role and Permission models
  };

  return RolePermission;
};
