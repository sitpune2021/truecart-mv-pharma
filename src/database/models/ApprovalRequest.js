module.exports = (sequelize, DataTypes) => {
  const ApprovalRequest = sequelize.define('ApprovalRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Request Information
    request_type: {
      type: DataTypes.ENUM('create', 'update', 'delete'),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Requestor Information
    requested_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // Request Data
    current_data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    proposed_data: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    change_summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    request_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Approval Status
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending'
    },
    // Reviewer Information
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewer_remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Modified Data
    final_data: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // Applied Status
    is_applied: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    applied_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    // Metadata
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Timestamps
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
    }
  }, {
    tableName: 'tc_approval_requests',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['status'] },
      { fields: ['requested_by'] },
      { fields: ['reviewed_by'] },
      { fields: ['created_at'] },
      { fields: ['request_type'] }
    ]
  });

  ApprovalRequest.associate = (models) => {
    ApprovalRequest.belongsTo(models.User, {
      foreignKey: 'requested_by',
      as: 'requester'
    });

    ApprovalRequest.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer'
    });

    ApprovalRequest.belongsTo(models.User, {
      foreignKey: 'applied_by',
      as: 'applier'
    });

    ApprovalRequest.hasMany(models.ApprovalHistory, {
      foreignKey: 'approval_request_id',
      as: 'history'
    });

    ApprovalRequest.hasMany(models.ApprovalNotification, {
      foreignKey: 'approval_request_id',
      as: 'notifications'
    });
  };

  return ApprovalRequest;
};
