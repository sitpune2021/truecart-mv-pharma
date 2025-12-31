module.exports = (sequelize, DataTypes) => {
  const DataChangeHistory = sequelize.define('DataChangeHistory', {
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
    field_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    new_value: {
      type: DataTypes.TEXT,
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
    change_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'tc_data_change_history',
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ['table_name', 'record_id'] },
      { fields: ['field_name'] },
      { fields: ['changed_at'] },
      { fields: ['changed_by'] }
    ]
  });

  DataChangeHistory.associate = (models) => {
    DataChangeHistory.belongsTo(models.User, {
      foreignKey: 'changed_by',
      as: 'changedByUser'
    });
  };

  return DataChangeHistory;
};
