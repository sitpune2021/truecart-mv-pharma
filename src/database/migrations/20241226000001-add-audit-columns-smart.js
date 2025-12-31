module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Starting smart audit columns migration...\n');

      // Helper function to check if column exists
      const columnExists = async (tableName, columnName) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name = '${tableName}' AND column_name = '${columnName}';`,
          { transaction }
        );
        return results.length > 0;
      };

      // Helper function to add column if not exists
      const addColumnIfNotExists = async (tableName, columnName, columnDef) => {
        const exists = await columnExists(tableName, columnName);
        if (!exists) {
          await queryInterface.addColumn(tableName, columnName, columnDef, { transaction });
          console.log(`✅ Added ${columnName} to ${tableName}`);
        } else {
          console.log(`⏭️  ${columnName} already exists in ${tableName}`);
        }
      };

      // Add audit columns to roles table
      console.log('\n📋 Processing roles table...');
      await addColumnIfNotExists('roles', 'updated_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });
      await addColumnIfNotExists('roles', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('roles', 'deleted_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Add audit columns to permissions table
      console.log('\n📋 Processing permissions table...');
      await addColumnIfNotExists('permissions', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('permissions', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });
      await addColumnIfNotExists('permissions', 'updated_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });
      await addColumnIfNotExists('permissions', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('permissions', 'deleted_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Add audit columns to sessions table
      console.log('\n📋 Processing sessions table...');
      await addColumnIfNotExists('sessions', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('sessions', 'revoked_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('sessions', 'revoked_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Add audit columns to refresh_tokens table
      console.log('\n📋 Processing refresh_tokens table...');
      await addColumnIfNotExists('refresh_tokens', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('refresh_tokens', 'revoked_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Add audit columns to password_reset_tokens table
      console.log('\n📋 Processing password_reset_tokens table...');
      await addColumnIfNotExists('password_reset_tokens', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });

      // Add audit columns to user_roles table
      console.log('\n📋 Processing user_roles table...');
      await addColumnIfNotExists('user_roles', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('user_roles', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('user_roles', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('user_roles', 'revoked_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('user_roles', 'revoked_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Add audit columns to role_permissions table
      console.log('\n📋 Processing role_permissions table...');
      await addColumnIfNotExists('role_permissions', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('role_permissions', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addColumnIfNotExists('role_permissions', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('role_permissions', 'revoked_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addColumnIfNotExists('role_permissions', 'revoked_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Add audit columns to users table (missing ones)
      console.log('\n📋 Processing users table...');
      await addColumnIfNotExists('users', 'created_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });
      await addColumnIfNotExists('users', 'updated_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });
      await addColumnIfNotExists('users', 'deleted_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      });

      // Create indexes for better performance
      console.log('\n📇 Creating indexes...');
      
      const indexExists = async (indexName) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}';`,
          { transaction }
        );
        return results.length > 0;
      };

      if (!(await indexExists('idx_roles_deleted_at'))) {
        await queryInterface.addIndex('roles', ['deleted_at'], {
          name: 'idx_roles_deleted_at',
          transaction
        });
        console.log('✅ Created index idx_roles_deleted_at');
      }

      if (!(await indexExists('idx_permissions_deleted_at'))) {
        await queryInterface.addIndex('permissions', ['deleted_at'], {
          name: 'idx_permissions_deleted_at',
          transaction
        });
        console.log('✅ Created index idx_permissions_deleted_at');
      }

      if (!(await indexExists('idx_user_roles_deleted_at'))) {
        await queryInterface.addIndex('user_roles', ['deleted_at'], {
          name: 'idx_user_roles_deleted_at',
          transaction
        });
        console.log('✅ Created index idx_user_roles_deleted_at');
      }

      if (!(await indexExists('idx_role_permissions_deleted_at'))) {
        await queryInterface.addIndex('role_permissions', ['deleted_at'], {
          name: 'idx_role_permissions_deleted_at',
          transaction
        });
        console.log('✅ Created index idx_role_permissions_deleted_at');
      }

      if (!(await indexExists('idx_sessions_revoked_at'))) {
        await queryInterface.addIndex('sessions', ['revoked_at'], {
          name: 'idx_sessions_revoked_at',
          transaction
        });
        console.log('✅ Created index idx_sessions_revoked_at');
      }

      await transaction.commit();
      console.log('\n✅ Successfully added audit columns to all tables');
    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error adding audit columns:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('🔄 Rolling back audit columns migration...\n');

      // Helper to safely remove column
      const removeColumnIfExists = async (tableName, columnName) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name = '${tableName}' AND column_name = '${columnName}';`,
          { transaction }
        );
        if (results.length > 0) {
          await queryInterface.removeColumn(tableName, columnName, { transaction });
          console.log(`✅ Removed ${columnName} from ${tableName}`);
        }
      };

      // Remove indexes
      const removeIndexIfExists = async (indexName) => {
        const [results] = await queryInterface.sequelize.query(
          `SELECT indexname FROM pg_indexes WHERE indexname = '${indexName}';`,
          { transaction }
        );
        if (results.length > 0) {
          await queryInterface.removeIndex(null, indexName, { transaction });
          console.log(`✅ Removed index ${indexName}`);
        }
      };

      await removeIndexIfExists('idx_roles_deleted_at');
      await removeIndexIfExists('idx_permissions_deleted_at');
      await removeIndexIfExists('idx_user_roles_deleted_at');
      await removeIndexIfExists('idx_role_permissions_deleted_at');
      await removeIndexIfExists('idx_sessions_revoked_at');

      // Remove columns from all tables
      await removeColumnIfExists('roles', 'updated_by');
      await removeColumnIfExists('roles', 'deleted_at');
      await removeColumnIfExists('roles', 'deleted_by');
      
      await removeColumnIfExists('permissions', 'updated_at');
      await removeColumnIfExists('permissions', 'created_by');
      await removeColumnIfExists('permissions', 'updated_by');
      await removeColumnIfExists('permissions', 'deleted_at');
      await removeColumnIfExists('permissions', 'deleted_by');
      
      await removeColumnIfExists('sessions', 'updated_at');
      await removeColumnIfExists('sessions', 'revoked_at');
      await removeColumnIfExists('sessions', 'revoked_by');
      
      await removeColumnIfExists('refresh_tokens', 'updated_at');
      await removeColumnIfExists('refresh_tokens', 'revoked_by');
      
      await removeColumnIfExists('password_reset_tokens', 'updated_at');
      
      await removeColumnIfExists('user_roles', 'created_at');
      await removeColumnIfExists('user_roles', 'updated_at');
      await removeColumnIfExists('user_roles', 'deleted_at');
      await removeColumnIfExists('user_roles', 'revoked_at');
      await removeColumnIfExists('user_roles', 'revoked_by');
      
      await removeColumnIfExists('role_permissions', 'created_at');
      await removeColumnIfExists('role_permissions', 'updated_at');
      await removeColumnIfExists('role_permissions', 'deleted_at');
      await removeColumnIfExists('role_permissions', 'revoked_at');
      await removeColumnIfExists('role_permissions', 'revoked_by');
      
      await removeColumnIfExists('users', 'created_by');
      await removeColumnIfExists('users', 'updated_by');
      await removeColumnIfExists('users', 'deleted_by');

      await transaction.commit();
      console.log('\n✅ Successfully rolled back audit columns');
    } catch (error) {
      await transaction.rollback();
      console.error('\n❌ Error rolling back:', error.message);
      throw error;
    }
  }
};
