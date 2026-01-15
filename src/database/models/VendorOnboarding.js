module.exports = (sequelize, DataTypes) => {
  const VendorOnboarding = sequelize.define('VendorOnboarding', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    // Business Information
    business_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    business_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gst_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    pan_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    drug_license_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Contact Information
    business_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    business_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    alternate_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    // Address Information
    address_line1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address_line2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: 'India'
    },
    // Bank Details
    bank_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ifsc_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    account_holder_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    // Documents
    documents: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    // Additional Information
    years_in_business: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    website_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // Onboarding Status
    onboarding_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'under_review'),
      defaultValue: 'pending'
    },
    onboarding_completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tc_users',
        key: 'id'
      }
    },
    approval_remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Audit Fields
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
    }
  }, {
    tableName: 'tc_vendor_onboarding',
    timestamps: true,
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['onboarding_status'] },
      { fields: ['gst_number'], unique: true },
      { fields: ['created_at'] }
    ]
  });

  VendorOnboarding.associate = (models) => {
    VendorOnboarding.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    VendorOnboarding.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approver'
    });

    VendorOnboarding.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    VendorOnboarding.belongsTo(models.User, {
      foreignKey: 'updated_by',
      as: 'updater'
    });
  };

  return VendorOnboarding;
};
