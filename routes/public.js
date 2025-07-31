const express = require('express');
const { Category, Tour, ContactMessage } = require('../models');

const router = express.Router();

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ 
      where: { status: 'active' },
      order: [['sort_order', 'ASC']]
    });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Contact form
router.post('/contact', async (req, res) => {
  try {
    const message = await ContactMessage.create({
      ...req.body,
      ip_address: req.ip
    });
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
