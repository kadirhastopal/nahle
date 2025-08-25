const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const generateToken = (admin) => {
    return jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ 
            where: { username, is_active: true } 
        });
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı'
            });
        }
        
        const isValid = await admin.validatePassword(password);
        
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı adı veya şifre hatalı'
            });
        }
        
        admin.last_login = new Date();
        await admin.save();
        
        const token = generateToken(admin);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        
        res.json({
            success: true,
            data: {
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    full_name: admin.full_name,
                    role: admin.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş sırasında hata oluştu'
        });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Çıkış başarılı'
    });
};

exports.me = async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.adminId, {
            attributes: ['id', 'username', 'email', 'full_name', 'role']
        });
        
        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Bilgiler alınamadı'
        });
    }
};
