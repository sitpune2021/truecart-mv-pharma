module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create audit_logs table
      await queryInterface.createTable('audit_logs', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        table_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        record_id: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        action: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'INSERT, UPDATE, DELETE, RESTORE'
        },
        old_values: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        new_values: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        changed_fields: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          allowNull: true
        },
        changed_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        changed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        request_id: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true
        }
      }, { transaction });

      // Create indexes for audit_logs
      await queryInterface.addIndex('audit_logs', ['table_name', 'record_id'], {
        name: 'idx_audit_logs_table_record',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['changed_by'], {
        name: 'idx_audit_logs_changed_by',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['changed_at'], {
        name: 'idx_audit_logs_changed_at',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['action'], {
        name: 'idx_audit_logs_action',
        transaction
      });

      await queryInterface.addIndex('audit_logs', ['request_id'], {
        name: 'idx_audit_logs_request_id',
        transaction
      });

      // Create user_activity_logs table
      await queryInterface.createTable('user_activity_logs', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        activity_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'LOGIN, LOGOUT, PASSWORD_CHANGE, PROFILE_UPDATE, etc.'
        },
        activity_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'SUCCESS, FAILED, BLOCKED'
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        location: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        device_info: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        request_id: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // Create indexes for user_activity_logs
      await queryInterface.addIndex('user_activity_logs', ['user_id'], {
        name: 'idx_user_activity_user_id',
        transaction
      });

      await queryInterface.addIndex('user_activity_logs', ['activity_type'], {
        name: 'idx_user_activity_type',
        transaction
      });

      await queryInterface.addIndex('user_activity_logs', ['created_at'], {
        name: 'idx_user_activity_created_at',
        transaction
      });

      await queryInterface.addIndex('user_activity_logs', ['status'], {
        name: 'idx_user_activity_status',
        transaction
      });

      await queryInterface.addIndex('user_activity_logs', ['ip_address'], {
        name: 'idx_user_activity_ip_address',
        transaction
      });

      // Create data_change_history table
      await queryInterface.createTable('data_change_history', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        table_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        record_id: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        field_name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        old_value: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        new_value: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        changed_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        changed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        change_reason: {
          type: Sequelize.TEXT,
          allowNull: true
        }
      }, { transaction });

      // Create indexes for data_change_history
      await queryInterface.addIndex('data_change_history', ['table_name', 'record_id'], {
        name: 'idx_data_change_table_record',
        transaction
      });

      await queryInterface.addIndex('data_change_history', ['field_name'], {
        name: 'idx_data_change_field',
        transaction
      });

      await queryInterface.addIndex('data_change_history', ['changed_at'], {
        name: 'idx_data_change_changed_at',
        transaction
      });

      await queryInterface.addIndex('data_change_history', ['changed_by'], {
        name: 'idx_data_change_changed_by',
        transaction
      });

      await transaction.commit();
      console.log('✅ Successfully created audit logging tables');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating audit logging tables:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      await queryInterface.dropTable('data_change_history', { transaction });
      await queryInterface.dropTable('user_activity_logs', { transaction });
      await queryInterface.dropTable('audit_logs', { transaction });

      await transaction.commit();
      console.log('✅ Successfully dropped audit logging tables');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error dropping audit logging tables:', error);
      throw error;
    }
  }
};
