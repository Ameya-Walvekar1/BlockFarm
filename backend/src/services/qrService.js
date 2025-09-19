const QRCode = require('qrcode');

class QRService {
    async generateQRCode(data) {
        try {
            const serverIP = global.SERVER_IP || 'localhost';
            const serverPort = global.SERVER_PORT || 3001;
            
            // Encode product data in base64 to include in URL
            const productDataBase64 = Buffer.from(JSON.stringify(data)).toString('base64');
            
            // Create verification URL with encoded product data
            const verificationUrl = 'http://' + serverIP + ':' + serverPort + '/verify/' + data.id + '?data=' + productDataBase64;

            const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                quality: 0.92,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                width: parseInt(process.env.QR_CODE_SIZE) || 300
            });

            console.log('📱 QR Code generated with full product data:');
            console.log('   - Product: ' + data.name + ' (' + data.id + ')');
            console.log('   - Farmer: ' + data.farmer);
            console.log('   - Origin: ' + data.origin);
            console.log('   - Verification URL: ' + verificationUrl);
            console.log('   - Mobile can scan and see all details');

            return {
                dataURL: qrCodeDataURL,
                data: JSON.stringify(data),
                verificationUrl: verificationUrl,
                mobileInstructions: {
                    network: 'Ensure mobile device is on same WiFi as server (' + serverIP + ')',
                    test: 'Test connection: http://' + serverIP + ':' + serverPort + '/health',
                    scan: 'Scan QR code to see full product details'
                }
            };
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code');
        }
    }

    parseQRData(qrData) {
        try {
            return JSON.parse(qrData);
        } catch (error) {
            console.error('Error parsing QR data:', error);
            throw new Error('Invalid QR code data');
        }
    }

    async generateSimpleQRCode(url) {
        try {
            const qrCodeDataURL = await QRCode.toDataURL(url, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                quality: 0.92,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
                width: 300
            });

            return {
                dataURL: qrCodeDataURL,
                url: url
            };
        } catch (error) {
            console.error('Error generating simple QR code:', error);
            throw new Error('Failed to generate simple QR code');
        }
    }
}

module.exports = new QRService();
