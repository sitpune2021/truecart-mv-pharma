module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    display_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    owner_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    created_by_type: {
      type: DataTypes.ENUM('system', 'admin', 'vendor'),
      allowNull: false
    },
    created_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_roles',
        key: 'id'
      }
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    }
  }, {
    tableName: 'tc_roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['created_by_type'] },
      { fields: ['created_by_id'] },
      { fields: ['owner_user_id'] },
      { fields: ['parent_role_id'] },
      { fields: ['is_active'] },
      {
        unique: true,
        fields: ['name', 'created_by_type', 'created_by_id']
      }
    ]
  });

  Role.associate = (models) => {
    // Role belongs to parent role
    Role.belongsTo(Role, {
      foreignKey: 'parent_role_id',
      as: 'parentRole'
    });

    // Role has many child roles
    Role.hasMany(Role, {
      foreignKey: 'parent_role_id',
      as: 'childRoles'
    });

    // Role belongs to many permissions
    Role.belongsToMany(models.Permission, {
      through: models.RolePermission,
      foreignKey: 'role_id',
      otherKey: 'permission_id',
      as: 'permissions'
    });

    // Role belongs to many users
    Role.belongsToMany(models.User, {
      through: models.UserRole,
      foreignKey: 'role_id',
      otherKey: 'user_id',
      as: 'users'
    });
  };

  return Role;
};
