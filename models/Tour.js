// models/Tour.js - Genişletilmiş Versiyon (Detaylı Tur Sayfası İçin)
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Tour = sequelize.define('Tour', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    
    // ============ TEMEL BİLGİLER ============
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 200]
        }
    },
    slug: {
        type: DataTypes.STRING(200),
        unique: true,
        allowNull: false,
        validate: {
            isLowercase: true,
            is: /^[a-z0-9-]+$/
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    short_description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    
    // ============ TARİH VE SÜRE ============
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 365
        }
    },
    duration_nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 365
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    
    // ============ MEKKE VE MEDİNE DAĞILIMI ============
    mekke_nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    medine_nights: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    
    // ============ FİYAT VE KOTA ============
    price_try: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    price_usd: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    available_quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    
    // ============ UÇAK BİLGİLERİ ============
    departure_info: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            airline: '',
            departure_city: 'İstanbul',
            departure_airport: 'IST',
            departure_date: null,
            departure_time: '',
            arrival_city: '',
            arrival_airport: '',
            arrival_date: null,
            arrival_time: ''
        }
    },
    return_info: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            airline: '',
            departure_city: '',
            departure_airport: '',
            departure_date: null,
            departure_time: '',
            arrival_city: 'İstanbul',
            arrival_airport: 'IST',
            arrival_date: null,
            arrival_time: ''
        }
    },
    
    // ============ SORUMLULAR ============
    responsible_contacts: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            airport: { name: '', phone: '' },
            medine: { name: '', phone: '' },
            mekke: [
                { name: '', phone: '' },
                { name: '', phone: '' }
            ]
        }
    },
    
    // ============ OTEL BİLGİLERİ ============
    mekke_hotel: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            name: '',
            address: '',
            region: '',
            distance_to_harem: '',
            distance_unit: 'km',
            features: [],
            star_rating: 0,
            location_coords: { lat: null, lng: null }
        }
    },
    medine_hotel: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            name: '',
            address: '',
            region: '',
            distance_to_harem: '',
            distance_unit: 'metre',
            features: [],
            star_rating: 0,
            location_coords: { lat: null, lng: null }
        }
    },
    
    // ============ HİZMETLER ============
    included_services: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    excluded_services: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    extra_features: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    
    // ============ EVRAKLAR VE KURALLAR ============
    required_documents: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    important_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cancellation_policy: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    payment_terms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    
    // ============ ZİYARET YERLERİ ============
    visit_places: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            mekke: [],
            medine: [],
            other: []
        }
    },
    
    // ============ GÖRSEL İÇERİK ============
    featured_image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    gallery: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    hotel_images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
            mekke: [],
            medine: []
        }
    },
    
    // ============ PROGRAM DETAYLARI ============
    program_details: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    daily_schedule: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    
    // ============ DURUM VE SEO ============
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'full', 'completed'),
        defaultValue: 'active'
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0,
            max: 100
        }
    },
    seo_title: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    seo_description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    seo_keywords: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'tours',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['slug'],
            unique: true
        },
        {
            fields: ['featured']
        },
        {
            fields: ['priority']
        },
        {
            fields: ['start_date']
        }
    ]
});

// ============ MODEL METODLARI ============
Tour.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Price formatting
    if (values.price_try) {
        values.formatted_price_try = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(values.price_try);
    }
    
    if (values.price_usd) {
        values.formatted_price_usd = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(values.price_usd);
    }
    
    // Availability status
    values.is_available = values.available_quota > 0 && values.status === 'active';
    values.is_full = values.available_quota === 0 || values.status === 'full';
    values.is_featured = values.featured === true;
    
    // Duration display
    values.duration_display = values.duration_nights ? 
        `${values.duration_nights} Gece ${values.duration_days} Gün` : 
        `${values.duration_days} Gün`;
    
    // City nights display
    if (values.mekke_nights && values.medine_nights) {
        values.city_nights_display = `${values.mekke_nights} Gece Mekke | ${values.medine_nights} Gece Medine`;
    }
    
    // Date formatting
    if (values.start_date) {
        values.formatted_start_date = new Date(values.start_date).toLocaleDateString('tr-TR');
    }
    if (values.end_date) {
        values.formatted_end_date = new Date(values.end_date).toLocaleDateString('tr-TR');
    }
    
    return values;
};

// ============ STATIC METODLAR ============
Tour.findBySlug = function(slug) {
    return this.findOne({
        where: { slug, status: 'active' },
        include: ['Category']
    });
};

Tour.findActive = function(options = {}) {
    return this.findAll({
        where: { status: 'active' },
        order: [['priority', 'DESC'], ['created_at', 'DESC']],
        ...options
    });
};

Tour.findFeatured = function(limit = 6) {
    return this.findAll({
        where: { 
            status: 'active',
            featured: true 
        },
        order: [['priority', 'DESC'], ['created_at', 'DESC']],
        limit
    });
};

Tour.findByCategory = function(categoryId, options = {}) {
    return this.findAll({
        where: { 
            category_id: categoryId, 
            status: 'active' 
        },
        order: [['priority', 'DESC'], ['created_at', 'DESC']],
        ...options
    });
};

Tour.search = function(query, options = {}) {
    const { Op } = require('sequelize');
    return this.findAll({
        where: {
            status: 'active',
            [Op.or]: [
                { title: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } },
                { short_description: { [Op.iLike]: `%${query}%` } }
            ]
        },
        order: [['priority', 'DESC'], ['created_at', 'DESC']],
        ...options
    });
};

module.exports = Tour;