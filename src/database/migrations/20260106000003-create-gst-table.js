module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('tc_gst', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            value: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                unique: true
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

        await queryInterface.addIndex('tc_gst', ['value'], { unique: true });
        await queryInterface.addIndex('tc_gst', ['is_active']);
        await queryInterface.addIndex('tc_gst', ['deleted_at']);

        console.log('✅ tc_gst table created successfully');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('tc_gst');
        console.log('✅ tc_gst table dropped');
    }
};
