module.exports = (sequelize, DataTypes) => {
  const ApprovalHistory = sequelize.define('ApprovalHistory', {
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
    // Action Information
    action: {
      type: DataTypes.ENUM('submitted', 'reviewed', 'approved', 'rejected', 'cancelled', 'modified', 'applied'),
      allowNull: false
    },
    action_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    action_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Action Details
    previous_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    data_snapshot: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // Metadata
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'tc_approval_history',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['approval_request_id'] },
      { fields: ['action_by'] },
      { fields: ['created_at'] }
    ]
  });

  ApprovalHistory.associate = (models) => {
    ApprovalHistory.belongsTo(models.ApprovalRequest, {
      foreignKey: 'approval_request_id',
      as: 'approvalRequest'
    });

    ApprovalHistory.belongsTo(models.User, {
      foreignKey: 'action_by',
      as: 'actor'
    });
  };

  return ApprovalHistory;
};
