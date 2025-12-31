module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
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
    module: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    scope: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    display_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_permissions',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['module'] },
      { fields: ['action'] },
      { fields: ['scope'] },
      { fields: ['is_active'] }
    ]
  });

  Permission.associate = (models) => {
    // Permission belongs to many roles
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'permission_id',
      otherKey: 'role_id',
      as: 'roles'
    });
  };

  return Permission;
};
