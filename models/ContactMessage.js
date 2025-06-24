// models/ContactMessage.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            len: [10, 20]
        }
    },
    tour_type: {
        type: DataTypes.ENUM('hac', 'umre', 'both', 'other'),
        allowNull: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 2000]
        }
    },
    status: {
        type: DataTypes.ENUM('new', 'read', 'replied', 'archived'),
        defaultValue: 'new'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'contact_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['email']
        },
        {
            fields: ['tour_type']
        }
    ]
});

// Instance metodları
ContactMessage.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Status labels
    const statusLabels = {
        'new': 'Yeni',
        'read': 'Okundu',
        'replied': 'Yanıtlandı',
        'archived': 'Arşivlendi'
    };
    
    const tourTypeLabels = {
        'hac': 'Hac Turları',
        'umre': 'Umre Turları',
        'both': 'Her İkisi',
        'other': 'Diğer'
    };
    
    values.status_label = statusLabels[values.status] || values.status;
    values.tour_type_label = tourTypeLabels[values.tour_type] || values.tour_type;
    values.is_new = values.status === 'new';
    values.is_unread = ['new', 'read'].includes(values.status);
    values.created_date = values.created_at ? values.created_at.toLocaleDateString('tr-TR') : null;
    values.created_time = values.created_at ? values.created_at.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    }) : null;
    
    return values;
};

ContactMessage.prototype.markAsRead = async function() {
    if (this.status === 'new') {
        this.status = 'read';
        await this.save();
    }
    return this;
};

ContactMessage.prototype.markAsReplied = async function() {
    this.status = 'replied';
    await this.save();
    return this;
};

ContactMessage.prototype.archive = async function() {
    this.status = 'archived';
    await this.save();
    return this;
};

// Static metodlar
ContactMessage.findByStatus = function(status, options = {}) {
    return this.findAll({
        where: { status },
        order: [['created_at', 'DESC']],
        ...options
    });
};

ContactMessage.findNew = function(options = {}) {
    return this.findByStatus('new', options);
};

ContactMessage.findUnread = function(options = {}) {
    return this.findAll({
        where: { 
            status: ['new', 'read']
        },
        order: [['created_at', 'DESC']],
        ...options
    });
};

ContactMessage.findByTourType = function(tourType, options = {}) {
    return this.findAll({
        where: { tour_type: tourType },
        order: [['created_at', 'DESC']],
        ...options
    });
};

ContactMessage.getStats = async function() {
    const stats = await this.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    });
    
    const result = {
        total: 0,
        new: 0,
        read: 0,
        replied: 0,
        archived: 0
    };
    
    stats.forEach(stat => {
        result[stat.status] = parseInt(stat.count);
        result.total += parseInt(stat.count);
    });
    
    return result;
};

ContactMessage.getTourTypeStats = async function() {
    const stats = await this.findAll({
        attributes: [
            'tour_type',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['tour_type'],
        raw: true
    });
    
    const result = {
        hac: 0,
        umre: 0,
        both: 0,
        other: 0
    };
    
    stats.forEach(stat => {
        if (stat.tour_type) {
            result[stat.tour_type] = parseInt(stat.count);
        }
    });
    
    return result;
};

module.exports = ContactMessage;
