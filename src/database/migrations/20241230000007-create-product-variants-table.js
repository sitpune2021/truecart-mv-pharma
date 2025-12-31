/**
 * Product Variants Table - For Future Implementation
 * 
 * This table will store product variants (different pack sizes, colors, weights, etc.)
 * Each variant will have its own:
 * - Images
 * - Weight, dimensions, volume
 * - Color, type, and other attributes
 * - Stock (via tc_vendor_inventory)
 * - Pricing (can override parent product price)
 * 
 * The parent product (tc_products) contains common information,
 * while variants contain specific variations.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tc_product_variants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tc_products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Parent product ID'
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Unique SKU for this variant'
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'SEO-friendly URL slug for this variant'
      },
      variant_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Variant display name (e.g., "15 Tablets", "100ml", "Red - Large")'
      },
      
      // Variant-specific attributes
      pack_size: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Pack size (e.g., "15 tablets", "100ml", "30 capsules")'
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Weight in grams'
      },
      weight_unit: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'g',
        comment: 'Weight unit (g, kg, mg)'
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Volume in ml'
      },
      volume_unit: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: 'ml',
        comment: 'Volume unit (ml, l)'
      },
      dimensions: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Dimensions {length, width, height, unit}'
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Color variant'
      },
      size: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Size variant (S, M, L, XL, etc.)'
      },
      strength: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Medicine strength (e.g., "650mg", "500mg")'
      },
      form: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Medicine form (tablet, capsule, syrup, injection, etc.)'
      },
      
      // Variant-specific images
      images: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        defaultValue: [],
        comment: 'Variant-specific images'
      },
      primary_image: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Primary image for this variant'
      },
      
      // Variant-specific pricing (optional - can override parent)
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Variant price (overrides parent if set)'
      },
      cost_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Variant cost price'
      },
      mrp: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Variant MRP'
      },
      
      // Additional attributes (flexible JSON)
      attributes: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Additional variant attributes as JSON'
      },
      
      // Stock threshold
      low_stock_threshold: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
        comment: 'Low stock alert threshold'
      },
      
      // Status
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Is this the default variant to show?'
      },
      
      // SEO
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      
      // Audit fields
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      deleted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tc_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
    });

    // Indexes
    await queryInterface.addIndex('tc_product_variants', ['product_id']);
    await queryInterface.addIndex('tc_product_variants', ['sku'], { unique: true });
    await queryInterface.addIndex('tc_product_variants', ['slug'], { unique: true });
    await queryInterface.addIndex('tc_product_variants', ['is_active']);
    await queryInterface.addIndex('tc_product_variants', ['is_default']);
    await queryInterface.addIndex('tc_product_variants', ['deleted_at']);

    // Ensure only one default variant per product
    await queryInterface.addConstraint('tc_product_variants', {
      fields: ['product_id', 'is_default'],
      type: 'unique',
      name: 'unique_default_variant_per_product',
      where: {
        is_default: true,
        deleted_at: null
      }
    });

    console.log('✅ tc_product_variants table created (for future use)');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tc_product_variants');
    console.log('✅ tc_product_variants table dropped');
  }
};
