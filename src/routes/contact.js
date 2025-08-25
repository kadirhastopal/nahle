const router = require('express').Router();
const { Contact } = require('../models');
const { authMiddleware } = require('../middlewares/auth');
const nodemailer = require('nodemailer');

// Create contact message (Public)
router.post('/', async (req, res) => {
    try {
        const contact = await Contact.create(req.body);
        
        // Send email notification
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            
            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: process.env.SMTP_USER,
                subject: `Yeni İletişim Mesajı: ${req.body.subject}`,
                html: `
                    <h3>Yeni İletişim Mesajı</h3>
                    <p><strong>Ad Soyad:</strong> ${req.body.name}</p>
                    <p><strong>Email:</strong> ${req.body.email}</p>
                    <p><strong>Telefon:</strong> ${req.body.phone || '-'}</p>
                    <p><strong>Konu:</strong> ${req.body.subject}</p>
                    <p><strong>Mesaj:</strong></p>
                    <p>${req.body.message}</p>
                `
            });
        }
        
        res.status(201).json({ 
            success: true, 
            message: 'Mesajınız başarıyla gönderildi' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Mesaj gönderilemedi' 
        });
    }
});

// Get all messages (Admin)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Mesajlar alınamadı' 
        });
    }
});

// Mark as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Mesaj bulunamadı' 
            });
        }
        
        contact.is_read = true;
        await contact.save();
        
        res.json({ success: true, data: contact });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'İşlem başarısız' 
        });
    }
});

// Delete message
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const contact = await Contact.findByPk(req.params.id);
        if (!contact) {
            return res.status(404).json({ 
                success: false, 
                message: 'Mesaj bulunamadı' 
            });
        }
        
        await contact.destroy();
        res.json({ success: true, message: 'Mesaj silindi' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Mesaj silinemedi' 
        });
    }
});

module.exports = router;
