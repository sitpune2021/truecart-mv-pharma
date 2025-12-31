/**
 * MAJOR REFACTORING MIGRATION
 * - Changes all UUID primary keys to INT AUTO_INCREMENT
 * - Adds tc_ prefix to all tables
 * - Preserves data structure but allows fresh start
 * 
 * WARNING: This will drop all existing tables and recreate them
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Starting major refactoring...\n');

      // Drop all existing tables (fresh start)
      console.log('📋 Dropping old tables...');
      const tables = [
        'data_change_history',
        'user_activity_logs',
        'audit_logs',
        'products',
        'user_login_otps',
        'role_permissions',
        'user_roles',
        'password_reset_tokens',
        'refresh_tokens',
        'sessions',
        'permissions',
        'roles',
        'users',
        'SequelizeMeta'
      ];

      for (const table of tables) {
        await queryInterface.sequelize.query(
          `DROP TABLE IF EXISTS "${table}" CASCADE;`,
          { transaction }
        );
        console.log(`  ✅ Dropped ${table}`);
      }

      // Create tc_users table
      console.log('\n📋 Creating tc_users...');
      await queryInterface.createTable('tc_users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        },
        phone: {
          type: Sequelize.STRING(15),
          allowNull: true,
          unique: true
        },
        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        full_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        user_type: {
          type: Sequelize.ENUM('super_admin', 'admin', 'vendor', 'customer', 'delivery_agent'),
          allowNull: false,
          defaultValue: 'customer'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        is_verified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        profile_image: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        otp_code: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        otp_expiry: {
          type: Sequelize.DATE,
          allowNull: true
        },
        last_login_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      // Create indexes for tc_users
      await queryInterface.addIndex('tc_users', ['email'], { unique: true, transaction });
      await queryInterface.addIndex('tc_users', ['phone'], { unique: true, transaction });
      await queryInterface.addIndex('tc_users', ['user_type'], { transaction });
      await queryInterface.addIndex('tc_users', ['is_active'], { transaction });
      await queryInterface.addIndex('tc_users', ['deleted_at'], { transaction });

      // Create tc_roles table
      console.log('📋 Creating tc_roles...');
      await queryInterface.createTable('tc_roles', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        display_name: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_by_type: {
          type: Sequelize.ENUM('system', 'admin', 'vendor'),
          defaultValue: 'system'
        },
        created_by_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        parent_role_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        is_system: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('tc_roles', ['name'], { unique: true, transaction });
      await queryInterface.addIndex('tc_roles', ['is_active'], { transaction });
      await queryInterface.addIndex('tc_roles', ['deleted_at'], { transaction });

      // Create tc_permissions table
      console.log('📋 Creating tc_permissions...');
      await queryInterface.createTable('tc_permissions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        display_name: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        module: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        action: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        scope: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('tc_permissions', ['name'], { unique: true, transaction });
      await queryInterface.addIndex('tc_permissions', ['module'], { transaction });
      await queryInterface.addIndex('tc_permissions', ['deleted_at'], { transaction });

      // Create tc_user_roles table
      console.log('📋 Creating tc_user_roles...');
      await queryInterface.createTable('tc_user_roles', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_users', key: 'id' },
          onDelete: 'CASCADE'
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_roles', key: 'id' },
          onDelete: 'CASCADE'
        },
        assigned_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        assigned_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        revoked_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        revoked_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('tc_user_roles', ['user_id', 'role_id'], { unique: true, transaction });
      await queryInterface.addIndex('tc_user_roles', ['deleted_at'], { transaction });

      // Create tc_role_permissions table
      console.log('📋 Creating tc_role_permissions...');
      await queryInterface.createTable('tc_role_permissions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_roles', key: 'id' },
          onDelete: 'CASCADE'
        },
        permission_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_permissions', key: 'id' },
          onDelete: 'CASCADE'
        },
        granted_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        granted_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        revoked_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        revoked_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('tc_role_permissions', ['role_id', 'permission_id'], { unique: true, transaction });
      await queryInterface.addIndex('tc_role_permissions', ['deleted_at'], { transaction });

      // Create tc_sessions table
      console.log('📋 Creating tc_sessions...');
      await queryInterface.createTable('tc_sessions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_users', key: 'id' },
          onDelete: 'CASCADE'
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        ip_address: {
          type: Sequelize.INET,
          allowNull: true
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        revoked_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        revoked_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('tc_sessions', ['user_id'], { transaction });
      await queryInterface.addIndex('tc_sessions', ['token'], { transaction });
      await queryInterface.addIndex('tc_sessions', ['revoked_at'], { transaction });

      // Create tc_refresh_tokens table
      console.log('📋 Creating tc_refresh_tokens...');
      await queryInterface.createTable('tc_refresh_tokens', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_users', key: 'id' },
          onDelete: 'CASCADE'
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: false,
          unique: true
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        revoked_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        revoked_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        revoked_reason: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('tc_refresh_tokens', ['user_id'], { transaction });
      await queryInterface.addIndex('tc_refresh_tokens', ['token'], { unique: true, transaction });

      // Create tc_password_reset_tokens table
      console.log('📋 Creating tc_password_reset_tokens...');
      await queryInterface.createTable('tc_password_reset_tokens', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'tc_users', key: 'id' },
          onDelete: 'CASCADE'
        },
        token: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        used_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      await queryInterface.addIndex('tc_password_reset_tokens', ['user_id'], { transaction });
      await queryInterface.addIndex('tc_password_reset_tokens', ['token'], { unique: true, transaction });

      // Create tc_products table
      console.log('📋 Creating tc_products...');
      await queryInterface.createTable('tc_products', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        sku: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        category: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        brand: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        cost_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        mrp: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        stock_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        low_stock_threshold: {
          type: Sequelize.INTEGER,
          defaultValue: 10
        },
        unit: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        weight: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        dimensions: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        images: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          defaultValue: []
        },
        primary_image: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        tags: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          defaultValue: []
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        is_featured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        requires_prescription: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        deleted_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        deleted_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await queryInterface.addIndex('tc_products', ['sku'], { unique: true, transaction });
      await queryInterface.addIndex('tc_products', ['name'], { transaction });
      await queryInterface.addIndex('tc_products', ['category'], { transaction });
      await queryInterface.addIndex('tc_products', ['is_active'], { transaction });
      await queryInterface.addIndex('tc_products', ['deleted_at'], { transaction });

      // Create tc_audit_logs table
      console.log('📋 Creating tc_audit_logs...');
      await queryInterface.createTable('tc_audit_logs', {
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
          type: Sequelize.INTEGER,
          allowNull: false
        },
        action: {
          type: Sequelize.STRING(50),
          allowNull: false
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
          type: Sequelize.INTEGER,
          allowNull: true
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

      await queryInterface.addIndex('tc_audit_logs', ['table_name', 'record_id'], { transaction });
      await queryInterface.addIndex('tc_audit_logs', ['changed_by'], { transaction });
      await queryInterface.addIndex('tc_audit_logs', ['changed_at'], { transaction });

      // Create tc_user_activity_logs table
      console.log('📋 Creating tc_user_activity_logs...');
      await queryInterface.createTable('tc_user_activity_logs', {
        id: {
          type: Sequelize.BIGINT,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'tc_users', key: 'id' },
          onDelete: 'CASCADE'
        },
        activity_type: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        activity_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: true
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

      await queryInterface.addIndex('tc_user_activity_logs', ['user_id'], { transaction });
      await queryInterface.addIndex('tc_user_activity_logs', ['activity_type'], { transaction });
      await queryInterface.addIndex('tc_user_activity_logs', ['created_at'], { transaction });

      // Create tc_data_change_history table
      console.log('📋 Creating tc_data_change_history...');
      await queryInterface.createTable('tc_data_change_history', {
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
          type: Sequelize.INTEGER,
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
          type: Sequelize.INTEGER,
          allowNull: true
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

      await queryInterface.addIndex('tc_data_change_history', ['table_name', 'record_id'], { transaction });
      await queryInterface.addIndex('tc_data_change_history', ['changed_by'], { transaction });
      await queryInterface.addIndex('tc_data_change_history', ['changed_at'], { transaction });

      await transaction.commit();
      console.log('\n✅ Refactoring complete! All tables created with INT IDs and tc_ prefix');
    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error during refactoring:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const tables = [
        'tc_data_change_history',
        'tc_user_activity_logs',
        'tc_audit_logs',
        'tc_products',
        'tc_password_reset_tokens',
        'tc_refresh_tokens',
        'tc_sessions',
        'tc_role_permissions',
        'tc_user_roles',
        'tc_permissions',
        'tc_roles',
        'tc_users'
      ];

      for (const table of tables) {
        await queryInterface.dropTable(table, { transaction });
      }

      await transaction.commit();
      console.log('✅ Rollback complete');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
