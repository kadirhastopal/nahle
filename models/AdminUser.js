// models/AdminUser.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 50],
            isAlphanumeric: true
        }
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [2, 100]
        }
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'editor'),
        defaultValue: 'editor'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'admin_users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['username'],
            unique: true
        },
        {
            fields: ['email'],
            unique: true
        },
        {
            fields: ['status']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash && !user.password_hash.startsWith('$2b$')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash') && !user.password_hash.startsWith('$2b$')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 12);
            }
        }
    }
});

// Instance metodları
AdminUser.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Şifreyi JSON'dan çıkar
    delete values.password_hash;
    
    // Role permissions
    values.permissions = {
        can_create: ['super_admin', 'admin'].includes(values.role),
        can_edit: ['super_admin', 'admin', 'editor'].includes(values.role),
        can_delete: ['super_admin', 'admin'].includes(values.role),
        can_manage_users: values.role === 'super_admin',
        can_manage_settings: ['super_admin', 'admin'].includes(values.role)
    };
    
    values.is_active = values.status === 'active';
    values.display_name = values.full_name || values.username;
    
    return values;
};

AdminUser.prototype.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password_hash);
};

AdminUser.prototype.updateLastLogin = async function() {
    this.last_login = new Date();
    await this.save({ fields: ['last_login'] });
};

// Static metodlar
AdminUser.findByUsername = function(username) {
    return this.findOne({
        where: { 
            username: username.toLowerCase(),
            status: 'active'
        }
    });
};

AdminUser.findByEmail = function(email) {
    return this.findOne({
        where: { 
            email: email.toLowerCase(),
            status: 'active'
        }
    });
};

AdminUser.findActive = function(options = {}) {
    return this.findAll({
        where: { status: 'active' },
        order: [['created_at', 'DESC']],
        ...options
    });
};

AdminUser.authenticate = async function(login, password) {
    const { Op } = require('sequelize');
    
    // Email veya username ile giriş
    const user = await this.findOne({
        where: {
            [Op.or]: [
                { email: login.toLowerCase() },
                { username: login.toLowerCase() }
            ],
            status: 'active'
        }
    });
    
    if (!user) {
        return null;
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
        return null;
    }
    
    await user.updateLastLogin();
    return user;
};

module.exports = AdminUser;
