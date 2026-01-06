const { Sequelize } = require('sequelize');
const config = require('../../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
    define: {
      schema: 'public',
      underscored: true,
      paranoid: true,
      freezeTableName: false
    },
    logging: console.log
  }
);

const db = {};

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Session = require('./Session')(sequelize, Sequelize.DataTypes);
db.RefreshToken = require('./RefreshToken')(sequelize, Sequelize.DataTypes);
db.PasswordResetToken = require('./PasswordResetToken')(sequelize, Sequelize.DataTypes);
db.Role = require('./Role')(sequelize, Sequelize.DataTypes);
db.Permission = require('./Permission')(sequelize, Sequelize.DataTypes);
db.RolePermission = require('./RolePermission')(sequelize, Sequelize.DataTypes);
db.UserRole = require('./UserRole')(sequelize, Sequelize.DataTypes);

// Import audit models
db.AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);
db.UserActivityLog = require('./UserActivityLog')(sequelize, Sequelize.DataTypes);
db.DataChangeHistory = require('./DataChangeHistory')(sequelize, Sequelize.DataTypes);

// Import master data models
db.Manufacturer = require('./Manufacturer')(sequelize, Sequelize.DataTypes);
db.Supplier = require('./Supplier')(sequelize, Sequelize.DataTypes);
db.Brand = require('./Brand')(sequelize, Sequelize.DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);
db.ProductName = require('./ProductName')(sequelize, Sequelize.DataTypes);
db.Salt = require('./Salt')(sequelize, Sequelize.DataTypes);
db.Dosage = require('./Dosage')(sequelize, Sequelize.DataTypes);
db.UnitType = require('./UnitType')(sequelize, Sequelize.DataTypes);
db.Attribute = require('./Attribute')(sequelize, Sequelize.DataTypes);
db.GST = require('./GST')(sequelize, Sequelize.DataTypes);
db.ProductVariant = require('./ProductVariant')(sequelize, Sequelize.DataTypes);

// Import product model
db.Product = require('./Product')(sequelize, Sequelize.DataTypes);

// Import inventory models
db.VendorInventory = require('./VendorInventory')(sequelize, Sequelize.DataTypes);
db.InventoryLog = require('./InventoryLog')(sequelize, Sequelize.DataTypes);

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
