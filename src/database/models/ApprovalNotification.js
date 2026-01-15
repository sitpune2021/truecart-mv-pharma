module.exports = (sequelize, DataTypes) => {
  const ApprovalNotification = sequelize.define('ApprovalNotification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    approval_request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_approval_requests',
        key: 'id'
      }
    },
    // Notification Details
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    notification_type: {
      type: DataTypes.ENUM('new_request', 'approved', 'rejected', 'modified', 'cancelled'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Status
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Metadata
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_approval_notifications',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['recipient_id', 'is_read'] },
      { fields: ['approval_request_id'] },
      { fields: ['created_at'] }
    ]
  });

  ApprovalNotification.associate = (models) => {
    ApprovalNotification.belongsTo(models.ApprovalRequest, {
      foreignKey: 'approval_request_id',
      as: 'approvalRequest'
    });

    ApprovalNotification.belongsTo(models.User, {
      foreignKey: 'recipient_id',
      as: 'recipient'
    });
  };

  return ApprovalNotification;
};
