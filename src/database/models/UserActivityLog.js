module.exports = (sequelize, DataTypes) => {
  const UserActivityLog = sequelize.define('UserActivityLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    activity_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    activity_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [['SUCCESS', 'FAILED', 'BLOCKED', 'PENDING']]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    device_info: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    request_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_user_activity_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['activity_type'] },
      { fields: ['created_at'] },
      { fields: ['status'] },
      { fields: ['ip_address'] }
    ]
  });

  UserActivityLog.associate = (models) => {
    UserActivityLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return UserActivityLog;
};
