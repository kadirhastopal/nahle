// models/Tour.js
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
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
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
    hotel_info: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    included_services: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    excluded_services: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    program_details: {
        type: DataTypes.JSON,
        allowNull: true
    },
    featured_image: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    gallery: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'full', 'completed'),
        defaultValue: 'active'
    },
    seo_title: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    seo_description: {
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
        }
    ]
});

// Model metodları
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
    
    return values;
};

// Static metodlar
Tour.findBySlug = function(slug) {
    return this.findOne({
        where: { slug, status: 'active' },
        include: ['Category']
    });
};

Tour.findActive = function(options = {}) {
    return this.findAll({
        where: { status: 'active' },
        order: [['created_at', 'DESC']],
        ...options
    });
};

Tour.findByCategory = function(categoryId, options = {}) {
    return this.findAll({
        where: { 
            category_id: categoryId, 
            status: 'active' 
        },
        order: [['created_at', 'DESC']],
        ...options
    });
};

module.exports = Tour;
