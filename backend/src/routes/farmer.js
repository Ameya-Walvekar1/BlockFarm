const express = require('express');
const router = express.Router();
const qrService = require('../services/qrService');

// Mock farmer controller for testing
router.post('/products', async (req, res) => {
    try {
        const { name, farmer, origin, harvestDate, quantity, price, qualityCertification } = req.body;
        const productId = 'PRODUCT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        // Mock product data
        const productData = {
            id: productId,
            name: name,
            farmer: farmer,
            origin: origin,
            harvestDate: harvestDate,
            quantity: quantity,
            price: price,
            qualityCertification: qualityCertification,
            timestamp: new Date().toISOString(),
            status: 'created'
        };

        // Generate QR Code
        const qrCode = await qrService.generateQRCode(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product: productData,
                qrCode: qrCode.dataURL,
                verificationUrl: qrCode.verificationUrl,
                mobileInstructions: qrCode.mobileInstructions
            }
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// Get all products (mock)
router.get('/products', (req, res) => {
    res.json({
        success: true,
        data: [],
        message: 'Mock farmer products endpoint - blockchain integration pending'
    });
});

module.exports = router;
