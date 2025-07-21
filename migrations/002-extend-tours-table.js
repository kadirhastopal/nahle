// migrations/002-extend-tours-table.js
const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        console.log('🔄 Tour tablosunu genişletiyoruz...');
        
        // Önce mevcut sütunları kontrol et
        const tableDescription = await queryInterface.describeTable('tours');
        
        const columnsToAdd = [];
        
        // Yeni sütunları sadece yoksa ekle
        if (!tableDescription.duration_nights) {
            columnsToAdd.push(['duration_nights', {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 0,
                    max: 365
                }
            }]);
        }
        
        if (!tableDescription.mekke_nights) {
            columnsToAdd.push(['mekke_nights', {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            }]);
        }
        
        if (!tableDescription.medine_nights) {
            columnsToAdd.push(['medine_nights', {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0
            }]);
        }
        
        if (!tableDescription.departure_info) {
            columnsToAdd.push(['departure_info', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.return_info) {
            columnsToAdd.push(['return_info', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.responsible_contacts) {
            columnsToAdd.push(['responsible_contacts', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.mekke_hotel) {
            columnsToAdd.push(['mekke_hotel', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.medine_hotel) {
            columnsToAdd.push(['medine_hotel', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.extra_features) {
            columnsToAdd.push(['extra_features', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.required_documents) {
            columnsToAdd.push(['required_documents', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.important_notes) {
            columnsToAdd.push(['important_notes', {
                type: DataTypes.TEXT,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.cancellation_policy) {
            columnsToAdd.push(['cancellation_policy', {
                type: DataTypes.TEXT,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.payment_terms) {
            columnsToAdd.push(['payment_terms', {
                type: DataTypes.TEXT,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.visit_places) {
            columnsToAdd.push(['visit_places', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.hotel_images) {
            columnsToAdd.push(['hotel_images', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.daily_schedule) {
            columnsToAdd.push(['daily_schedule', {
                type: DataTypes.JSON,
                allowNull: true
            }]);
        }
        
        if (!tableDescription.featured) {
            columnsToAdd.push(['featured', {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }]);
        }
        
        if (!tableDescription.priority) {
            columnsToAdd.push(['priority', {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }]);
        }
        
        if (!tableDescription.seo_keywords) {
            columnsToAdd.push(['seo_keywords', {
                type: DataTypes.TEXT,
                allowNull: true
            }]);
        }
        
        // Sütunları ekle
        for (const [columnName, columnDefinition] of columnsToAdd) {
            console.log(`➕ ${columnName} sütunu ekleniyor...`);
            await queryInterface.addColumn('tours', columnName, columnDefinition);
        }
        
        // JSON sütunları için default değerler güncelle
        await queryInterface.sequelize.query(`
            UPDATE tours 
            SET 
                departure_info = COALESCE(departure_info, '{"airline":"","departure_city":"İstanbul","departure_airport":"IST"}'),
                return_info = COALESCE(return_info, '{"airline":"","arrival_city":"İstanbul","arrival_airport":"IST"}'),
                responsible_contacts = COALESCE(responsible_contacts, '{"airport":{"name":"","phone":""},"medine":{"name":"","phone":""},"mekke":[{"name":"","phone":""},{"name":"","phone":""}]}'),
                mekke_hotel = COALESCE(mekke_hotel, '{"name":"","address":"","region":"","distance_to_harem":"","features":[],"star_rating":0}'),
                medine_hotel = COALESCE(medine_hotel, '{"name":"","address":"","region":"","distance_to_harem":"","features":[],"star_rating":0}'),
                included_services = COALESCE(included_services, '[]'),
                excluded_services = COALESCE(excluded_services, '[]'),
                extra_features = COALESCE(extra_features, '[]'),
                required_documents = COALESCE(required_documents, '[]'),
                visit_places = COALESCE(visit_places, '{"mekke":[],"medine":[],"other":[]}'),
                hotel_images = COALESCE(hotel_images, '{"mekke":[],"medine":[]}'),
                daily_schedule = COALESCE(daily_schedule, '[]'),
                gallery = COALESCE(gallery, '[]'),
                program_details = COALESCE(program_details, '[]')
            WHERE 
                departure_info IS NULL OR 
                return_info IS NULL OR 
                responsible_contacts IS NULL OR 
                mekke_hotel IS NULL OR 
                medine_hotel IS NULL;
        `);
        
        // Yeni indeksleri ekle
        const indexes = await queryInterface.showIndex('tours');
        const indexNames = indexes.map(idx => idx.name);
        
        if (!indexNames.includes('tours_featured')) {
            await queryInterface.addIndex('tours', ['featured'], { name: 'tours_featured' });
        }
        
        if (!indexNames.includes('tours_priority')) {
            await queryInterface.addIndex('tours', ['priority'], { name: 'tours_priority' });
        }
        
        if (!indexNames.includes('tours_start_date')) {
            await queryInterface.addIndex('tours', ['start_date'], { name: 'tours_start_date' });
        }
        
        console.log('✅ Tour tablosu başarıyla genişletildi!');
    },

    down: async (queryInterface, Sequelize) => {
        console.log('🔄 Tour tablosunu eski haline getiriyoruz...');
        
        // Yeni eklenen sütunları kaldır
        const columnsToRemove = [
            'duration_nights',
            'mekke_nights', 
            'medine_nights',
            'departure_info',
            'return_info',
            'responsible_contacts',
            'mekke_hotel',
            'medine_hotel',
            'extra_features',
            'required_documents',
            'important_notes',
            'cancellation_policy',
            'payment_terms',
            'visit_places',
            'hotel_images',
            'daily_schedule',
            'featured',
            'priority',
            'seo_keywords'
        ];
        
        for (const columnName of columnsToRemove) {
            try {
                await queryInterface.removeColumn('tours', columnName);
                console.log(`➖ ${columnName} sütunu kaldırıldı`);
            } catch (error) {
                console.log(`⚠️  ${columnName} sütunu zaten yok: ${error.message}`);
            }
        }
        
        // İndeksleri kaldır
        try {
            await queryInterface.removeIndex('tours', 'tours_featured');
            await queryInterface.removeIndex('tours', 'tours_priority');
            await queryInterface.removeIndex('tours', 'tours_start_date');
        } catch (error) {
            console.log('⚠️  Bazı indeksler zaten kaldırılmış');
        }
        
        console.log('✅ Tour tablosu eski haline getirildi!');
    }
};