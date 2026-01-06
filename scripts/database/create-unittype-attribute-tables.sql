-- =====================================================
-- TrueCart Backend - Unit Type & Attribute Masters
-- SQL Queries to Create Tables in PostgreSQL
-- =====================================================
-- Run these queries in pgAdmin
-- Date: 2026-01-06
-- =====================================================

-- ==================== CREATE UNIT TYPES TABLE ====================

CREATE TABLE IF NOT EXISTS tc_unit_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_by INTEGER REFERENCES tc_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by INTEGER REFERENCES tc_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    deleted_by INTEGER REFERENCES tc_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for tc_unit_types
CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_types_name ON tc_unit_types(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_types_slug ON tc_unit_types(slug);
CREATE INDEX IF NOT EXISTS idx_unit_types_is_active ON tc_unit_types(is_active);
CREATE INDEX IF NOT EXISTS idx_unit_types_deleted_at ON tc_unit_types(deleted_at);

COMMENT ON TABLE tc_unit_types IS 'Master table for unit types (e.g., mg, ml, tablets, capsules)';
COMMENT ON COLUMN tc_unit_types.name IS 'Name of the unit type';
COMMENT ON COLUMN tc_unit_types.slug IS 'URL-friendly version of the name';
COMMENT ON COLUMN tc_unit_types.description IS 'Detailed description of the unit type';

-- ==================== CREATE ATTRIBUTES TABLE ====================

CREATE TABLE IF NOT EXISTS tc_attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_by INTEGER REFERENCES tc_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    updated_by INTEGER REFERENCES tc_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    deleted_by INTEGER REFERENCES tc_users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create indexes for tc_attributes
CREATE UNIQUE INDEX IF NOT EXISTS idx_attributes_name ON tc_attributes(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attributes_slug ON tc_attributes(slug);
CREATE INDEX IF NOT EXISTS idx_attributes_is_active ON tc_attributes(is_active);
CREATE INDEX IF NOT EXISTS idx_attributes_deleted_at ON tc_attributes(deleted_at);

COMMENT ON TABLE tc_attributes IS 'Master table for product attributes (e.g., Color, Size, Flavor)';
COMMENT ON COLUMN tc_attributes.name IS 'Name of the attribute';
COMMENT ON COLUMN tc_attributes.slug IS 'URL-friendly version of the name';
COMMENT ON COLUMN tc_attributes.description IS 'Detailed description of the attribute';

-- ==================== INSERT SAMPLE DATA (OPTIONAL) ====================

-- Sample Unit Types
INSERT INTO tc_unit_types (name, slug, description, is_active) VALUES
('Milligram (mg)', 'milligram-mg', 'Unit of mass in the metric system', true),
('Milliliter (ml)', 'milliliter-ml', 'Unit of volume in the metric system', true),
('Gram (g)', 'gram-g', 'Unit of mass in the metric system', true),
('Liter (L)', 'liter-l', 'Unit of volume in the metric system', true),
('Tablet', 'tablet', 'Solid dosage unit', true),
('Capsule', 'capsule', 'Gelatin shell dosage unit', true),
('Piece', 'piece', 'Individual unit count', true),
('Box', 'box', 'Packaging unit', true),
('Strip', 'strip', 'Blister pack unit', true),
('Bottle', 'bottle', 'Container unit', true)
ON CONFLICT (name) DO NOTHING;

-- Sample Attributes
INSERT INTO tc_attributes (name, slug, description, is_active) VALUES
('Color', 'color', 'Product color attribute', true),
('Size', 'size', 'Product size attribute', true),
('Flavor', 'flavor', 'Product flavor attribute', true),
('Strength', 'strength', 'Medicine strength attribute', true),
('Pack Size', 'pack-size', 'Package size attribute', true),
('Form', 'form', 'Product form attribute', true),
('Scent', 'scent', 'Product scent attribute', true),
('Material', 'material', 'Product material attribute', true)
ON CONFLICT (name) DO NOTHING;

-- ==================== VERIFICATION QUERIES ====================

-- Check if tables were created successfully
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('tc_unit_types', 'tc_attributes')
ORDER BY table_name;

-- View all unit types
SELECT id, name, slug, is_active, created_at FROM tc_unit_types ORDER BY name;

-- View all attributes
SELECT id, name, slug, is_active, created_at FROM tc_attributes ORDER BY name;

-- Count records
SELECT 
    'Unit Types' as master_type, 
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM tc_unit_types
UNION ALL
SELECT 
    'Attributes' as master_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM tc_attributes;

-- ==================== CLEANUP QUERIES (USE WITH CAUTION) ====================
-- Uncomment below to drop tables if needed

-- DROP TABLE IF EXISTS tc_unit_types CASCADE;
-- DROP TABLE IF EXISTS tc_attributes CASCADE;
