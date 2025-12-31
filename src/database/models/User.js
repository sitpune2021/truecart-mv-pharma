module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    owner_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    user_type: {
      type: DataTypes.ENUM('super_admin', 'admin', 'vendor', 'delivery_agent'),
      allowNull: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
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
    }
  }, {
    tableName: 'tc_users',
    schema: 'public',
    freezeTableName: true,
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['email'] },
      { fields: ['phone'] },
      { fields: ['user_type'] },
      { fields: ['is_active'] },
      { fields: ['created_at'] },
      { fields: ['owner_user_id'] }
    ]
  });

  User.associate = (models) => {
    // User has many sessions
    User.hasMany(models.Session, {
      foreignKey: 'user_id',
      as: 'sessions'
    });

    // User has many refresh tokens
    User.hasMany(models.RefreshToken, {
      foreignKey: 'user_id',
      as: 'refreshTokens'
    });

    // User has many password reset tokens
    User.hasMany(models.PasswordResetToken, {
      foreignKey: 'user_id',
      as: 'passwordResetTokens'
    });

    // User belongs to many roles
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: 'user_id',
      otherKey: 'role_id',
      as: 'roles'
    });
  };

  return User;
};
