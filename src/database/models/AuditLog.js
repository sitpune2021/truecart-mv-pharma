module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    record_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['INSERT', 'UPDATE', 'DELETE', 'RESTORE']]
      }
    },
    old_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    new_values: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    changed_fields: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true
    },
    changed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    request_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    tableName: 'tc_audit_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['table_name', 'record_id'] },
      { fields: ['changed_by'] },
      { fields: ['changed_at'] },
      { fields: ['action'] },
      { fields: ['request_id'] }
    ]
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'changed_by',
      as: 'changedByUser'
    });
  };

  return AuditLog;
};
