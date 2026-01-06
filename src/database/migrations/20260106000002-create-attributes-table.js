module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('tc_attributes', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            slug: {
                type: Sequelize.STRING(255),
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
            meta_title: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            meta_description: {
                type: Sequelize.TEXT,
                allowNull: true
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

        await queryInterface.addIndex('tc_attributes', ['name'], { unique: true });
        await queryInterface.addIndex('tc_attributes', ['slug'], { unique: true });
        await queryInterface.addIndex('tc_attributes', ['is_active']);
        await queryInterface.addIndex('tc_attributes', ['deleted_at']);

        console.log('✅ tc_attributes table created successfully');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('tc_attributes');
        console.log('✅ tc_attributes table dropped');
    }
};
