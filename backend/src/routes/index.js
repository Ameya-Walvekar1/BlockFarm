const express = require('express');
const router = express.Router();

// Mock farmer routes for now
const farmerRoutes = require('./farmer');
router.use('/farmer', farmerRoutes);

// API Info
router.get('/', (req, res) => {
    res.json({
        name: 'FarmTrace API',
        version: '1.0.0',
        description: 'Blockchain-based supply chain transparency for agricultural produce',
        endpoints: [
            'GET /api/farmer/products - Get all products',
            'POST /api/farmer/products - Create new product',
            'PUT /api/farmer/products/:id/transfer - Transfer product',
            'GET /api/qr/:productId - Get QR code for product'
        ]
    });
});

module.exports = router;
