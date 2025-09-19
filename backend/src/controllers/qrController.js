const fabricService = require('../services/fabricService');
const qrService = require('../services/qrService');

class QRController {
    async generateQR(req, res) {
        try {
            const { productId } = req.params;
            
            // Get product from blockchain
            const product = await fabricService.queryTransaction(
                'farmtrace', 
                'queryProduct', 
                productId
            );

            const productData = JSON.parse(product);
            const qrCode = await qrService.generateQRCode(productData);

            res.json({
                success: true,
                data: {
                    productId: productId,
                    qrCode: qrCode.dataURL,
                    qrData: qrCode.data
                }
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate QR code',
                error: error.message
            });
        }
    }

    async scanQR(req, res) {
        try {
            const { qrData } = req.body;
            
            const parsedData = qrService.parseQRData(qrData);
            
            // Verify the product exists on blockchain
            const product = await fabricService.queryTransaction(
                'farmtrace', 
                'queryProduct', 
                parsedData.productId
            );

            res.json({
                success: true,
                verified: true,
                data: {
                    scannedData: parsedData,
                    blockchainData: JSON.parse(product)
                }
            });
        } catch (error) {
            console.error('Error scanning QR code:', error);
            res.status(400).json({
                success: false,
                verified: false,
                message: 'Invalid QR code or product not found',
                error: error.message
            });
        }
    }
}

module.exports = new QRController();
