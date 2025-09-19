const express = require('express');
const router = express.Router();
const qrService = require('../services/qrService');
const fabricService = require('../services/fabricService');
// Generate QR code for existing product
router.get('/:productId', async (req, res) => {
try {
const { productId } = req.params;
// Get product data from blockchain
const productData = await fabricService.queryTransaction('farmtrace', 'queryProdu
const product = JSON.parse(productData);
// Generate QR code
const qrCode = await qrService.generateQRCode(product);
res.json({
success: true,
message: 'QR code generated successfully',
data: {
productId: productId,
qrCode: qrCode.dataURL,
verificationUrl: qrCode.verificationUrl,
mobileInstructions: qrCode.mobileInstructions
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
});
// Generate simple test QR code (for testing mobile connectivity)
router.post('/test', async (req, res) => {
try {
const serverIP = global.SERVER_IP || 'localhost';
const serverPort = global.SERVER_PORT || 3001;
const testUrl = `http://${serverIP}:${serverPort}/health`;
const qrCode = await qrService.generateSimpleQRCode(testUrl);
res.json({
success: true,
message: 'Test QR code generated',
data: {
qrCode: qrCode.dataURL,
testUrl: testUrl,
instructions: [
'Scan this QR code with your mobile device','It should open the health check endpoint',
'If it works, your network setup is correct'
]
}
});
} catch (error) {
console.error('Error generating test QR code:', error);
res.status(500).json({
success: false,
message: 'Failed to generate test QR code',
error: error.message
});
}
});
module.exports = router;
