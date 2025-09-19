const fabricService = require('../services/fabricService');
const qrService = require('../services/qrService');
const { validationResult } = require('express-validator');

class FarmerController {
    async createProduct(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, farmer, origin, harvestDate, quantity, price, qualityCertification } = req.body;
            const productId = `PRODUCT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Create product on blockchain
            const product = await fabricService.invokeTransaction(
                'farmtrace',
                'createProduct',
                productId, name, farmer, origin, harvestDate, quantity, price, qualityCertification || 'Standard'
            );

            // Generate QR Code
            const productData = JSON.parse(product);
            const qrCode = await qrService.generateQRCode(productData);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: {
                    product: productData,
                    qrCode: qrCode.dataURL
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
    }

    async getProducts(req, res) {
        try {
            const products = await fabricService.queryTransaction('farmtrace', 'queryAllProducts');
            
            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products',
                error: error.message
            });
        }
    }

    async transferProduct(req, res) {
        try {
            const { productId } = req.params;
            const { newHolder, location, action } = req.body;

            const result = await fabricService.invokeTransaction(
                'farmtrace',
                'transferProduct',
                productId, newHolder, location, action
            );

            res.json({
                success: true,
                message: 'Product transferred successfully',
                data: JSON.parse(result)
            });
        } catch (error) {
            console.error('Error transferring product:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to transfer product',
                error: error.message
            });
        }
    }
}

module.exports = new FarmerController();
