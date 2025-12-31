module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
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
      allowNull: false
    },
    device_info: {
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
    last_activity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_sessions',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token_hash'] },
      { fields: ['expires_at'] }
    ]
  });

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Session;
};
