require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(morgan('combined'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// View engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// Rate limiting - Fixed for proxy
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.'
        });
    },
    skip: (req) => {
        // Skip rate limiting for admin routes when authenticated
        return req.path.startsWith('/api/auth') || req.headers.authorization;
    }
});

app.use('/api/', limiter);

// Trust proxy
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/tours', require('./src/routes/tours'));
app.use('/api/blogs', require('./src/routes/blogs'));
app.use('/api/testimonials', require('./src/routes/testimonials'));
app.use('/api/contact', require('./src/routes/contact'));
app.use('/api/settings', require('./src/routes/settings'));

// Web routes
app.use('/', require('./src/routes/web'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Bir hata oluştu!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📌 Admin Panel: http://localhost:${PORT}/admin`);
});
