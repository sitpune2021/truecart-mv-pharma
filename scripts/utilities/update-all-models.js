/**
 * Batch update all models to use INT IDs and tc_ prefix
 * Run this after database migration is complete
 */

const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../../src/database/models');

const modelUpdates = {
  'Role.js': {
    tableName: 'tc_roles',
    idType: 'INTEGER',
    foreignKeys: {
      'created_by_id': 'INTEGER',
      'parent_role_id': 'INTEGER',
      'updated_by': 'INTEGER',
      'deleted_by': 'INTEGER'
    }
  },
  'Permission.js': {
    tableName: 'tc_permissions',
    idType: 'INTEGER',
    foreignKeys: {
      'created_by': 'INTEGER',
      'updated_by': 'INTEGER',
      'deleted_by': 'INTEGER'
    }
  },
  'Session.js': {
    tableName: 'tc_sessions',
    idType: 'INTEGER',
    foreignKeys: {
      'user_id': 'INTEGER',
      'revoked_by': 'INTEGER'
    }
  },
  'RefreshToken.js': {
    tableName: 'tc_refresh_tokens',
    idType: 'INTEGER',
    foreignKeys: {
      'user_id': 'INTEGER',
      'revoked_by': 'INTEGER'
    }
  },
  'PasswordResetToken.js': {
    tableName: 'tc_password_reset_tokens',
    idType: 'INTEGER',
    foreignKeys: {
      'user_id': 'INTEGER'
    }
  },
  'UserRole.js': {
    tableName: 'tc_user_roles',
    idType: 'INTEGER',
    foreignKeys: {
      'user_id': 'INTEGER',
      'role_id': 'INTEGER',
      'assigned_by': 'INTEGER',
      'revoked_by': 'INTEGER'
    }
  },
  'RolePermission.js': {
    tableName: 'tc_role_permissions',
    idType: 'INTEGER',
    foreignKeys: {
      'role_id': 'INTEGER',
      'permission_id': 'INTEGER',
      'granted_by': 'INTEGER',
      'revoked_by': 'INTEGER'
    }
  },
  'Product.js': {
    tableName: 'tc_products',
    idType: 'INTEGER',
    foreignKeys: {
      'created_by': 'INTEGER',
      'updated_by': 'INTEGER',
      'deleted_by': 'INTEGER'
    }
  },
  'AuditLog.js': {
    tableName: 'tc_audit_logs',
    idType: 'BIGINT',
    foreignKeys: {
      'changed_by': 'INTEGER'
    }
  },
  'UserActivityLog.js': {
    tableName: 'tc_user_activity_logs',
    idType: 'BIGINT',
    foreignKeys: {
      'user_id': 'INTEGER'
    }
  },
  'DataChangeHistory.js': {
    tableName: 'tc_data_change_history',
    idType: 'BIGINT',
    foreignKeys: {
      'changed_by': 'INTEGER'
    }
  }
};

function updateModel(fileName, config) {
  const filePath = path.join(modelsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  ${fileName} not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Update primary key ID type
  content = content.replace(
    /id:\s*{\s*type:\s*DataTypes\.UUID,\s*defaultValue:\s*DataTypes\.UUIDV4,\s*primaryKey:\s*true\s*}/g,
    `id: {\n      type: DataTypes.${config.idType},\n      primaryKey: true,\n      autoIncrement: true\n    }`
  );

  // Update table name
  content = content.replace(
    /tableName:\s*['"](\w+)['"]/g,
    `tableName: '${config.tableName}'`
  );

  // Update foreign key types
  Object.entries(config.foreignKeys).forEach(([key, type]) => {
    const regex = new RegExp(`${key}:\\s*{[^}]*type:\\s*DataTypes\\.UUID`, 'g');
    content = content.replace(regex, (match) => {
      return match.replace('DataTypes.UUID', `DataTypes.${type}`);
    });
  });

  // Update model references to use tc_ prefix
  content = content.replace(/model:\s*['"]users['"]/g, "model: 'tc_users'");
  content = content.replace(/model:\s*['"]roles['"]/g, "model: 'tc_roles'");
  content = content.replace(/model:\s*['"]permissions['"]/g, "model: 'tc_permissions'");
  content = content.replace(/model:\s*['"]products['"]/g, "model: 'tc_products'");

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated ${fileName}`);
}

console.log('🔄 Starting batch model update...\n');

Object.entries(modelUpdates).forEach(([fileName, config]) => {
  updateModel(fileName, config);
});

console.log('\n✅ All models updated successfully!');
console.log('\n📝 Next steps:');
console.log('1. Review updated models');
console.log('2. Update services and controllers');
console.log('3. Test the application');
