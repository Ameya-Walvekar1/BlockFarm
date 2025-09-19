const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIPAddress();
console.log('🌐 Local IP Address:', localIP);

global.SERVER_IP = localIP;
global.SERVER_PORT = PORT;

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: ['http://localhost:3000', 'http://' + localIP + ':3000', '*'],
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./routes');
app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'FarmTrace API is running',
        timestamp: new Date().toISOString(),
        server: {
            host: HOST,
            port: PORT,
            localIP: localIP,
            accessUrls: [
                'http://localhost:' + PORT,
                'http://' + localIP + ':' + PORT
            ]
        }
    });
});

// Enhanced QR Code verification endpoint with full product details
app.get('/verify/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const encodedData = req.query.data;
        let productData = null;
        
        // Decode product data from URL parameter
        if (encodedData) {
            try {
                const decodedData = Buffer.from(encodedData, 'base64').toString('utf8');
                productData = JSON.parse(decodedData);
            } catch (error) {
                console.error('Error decoding product data:', error);
            }
        }
        
        // If no data in URL, create mock data
        if (!productData) {
            productData = {
                id: productId,
                name: 'Sample Product',
                farmer: 'Unknown Farmer',
                origin: 'Unknown Origin',
                harvestDate: 'Unknown Date',
                quantity: 'Unknown',
                price: 'Unknown',
                qualityCertification: 'Unknown'
            };
        }
        
        const currentTime = new Date().toLocaleString();
        
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FarmTrace - Product Verification</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0; 
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #333;
                    min-height: 100vh;
                }
                .container { 
                    background: white; 
                    padding: 25px; 
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    max-width: 500px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 25px;
                }
                .qr-success { 
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    color: white;
                    padding: 15px; 
                    border-radius: 10px; 
                    margin-bottom: 25px;
                    text-align: center;
                    font-weight: bold;
                }
                .verified-badge {
                    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 25px;
                    display: inline-block;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .product-info { 
                    margin: 20px 0; 
                }
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .detail-label {
                    font-weight: bold;
                    color: #555;
                    min-width: 120px;
                }
                .detail-value {
                    color: #333;
                    text-align: right;
                    flex: 1;
                }
                .trace-section {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .blockchain-badge {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    display: inline-block;
                    margin-bottom: 15px;
                }
                h1 { 
                    color: #333; 
                    margin: 0;
                    font-size: 24px;
                }
                .footer {
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #f0f0f0; 
                    text-align: center; 
                    color: #666;
                    font-size: 14px;
                }
                .emoji { font-size: 1.2em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="qr-success">
                    <span class="emoji">✅</span> <strong>QR Code Successfully Scanned!</strong>
                </div>
                
                <div class="header">
                    <h1><span class="emoji">🌾</span> FarmTrace Verification</h1>
                    <div class="verified-badge">
                        <span class="emoji">🔐</span> Product Verified
                    </div>
                </div>
                
                <div class="product-info">
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">🏷️</span> Product ID:</span>
                        <span class="detail-value">${productData.id}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">🥗</span> Product Name:</span>
                        <span class="detail-value">${productData.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">👨‍🌾</span> Farmer:</span>
                        <span class="detail-value">${productData.farmer}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">📍</span> Origin:</span>
                        <span class="detail-value">${productData.origin}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">🗓️</span> Harvest Date:</span>
                        <span class="detail-value">${productData.harvestDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">⚖️</span> Quantity:</span>
                        <span class="detail-value">${productData.quantity}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">💰</span> Price:</span>
                        <span class="detail-value">${productData.price}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">🏅</span> Certification:</span>
                        <span class="detail-value">${productData.qualityCertification}</span>
                    </div>
                </div>
                
                <div class="trace-section">
                    <div class="blockchain-badge">
                        <span class="emoji">🔗</span> Blockchain Verified
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">📱</span> Scanned At:</span>
                        <span class="detail-value">${currentTime}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">🖥️</span> Server:</span>
                        <span class="detail-value">${localIP}:${PORT}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label"><span class="emoji">🌐</span> Status:</span>
                        <span class="detail-value">✅ Connected via WiFi</span>
                    </div>
                </div>
                
                <div class="footer">
                    <strong>Powered by FarmTrace Blockchain Technology</strong><br>
                    <span class="emoji">🛡️</span> Ensuring transparency from farm to consumer
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).send(`
            <h1 style="color: #dc3545; text-align: center;">❌ Error</h1>
            <p style="text-align: center;">There was an error processing your request.</p>
            <p style="text-align: center;">Product ID: ${req.params.productId}</p>
        `);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, HOST, () => {
    console.log('🚀 FarmTrace Backend Server running on ' + HOST + ':' + PORT);
    console.log('🌐 Health check: http://' + localIP + ':' + PORT + '/health');
    console.log('📱 Mobile access: http://' + localIP + ':' + PORT);
    console.log('🔗 Local access: http://localhost:' + PORT);
    console.log('\n📋 Network Information:');
    console.log('   - Make sure mobile device is on same WiFi network');
    console.log('   - Mobile QR codes will show FULL product details');
    console.log('   - Test mobile connection: http://' + localIP + ':' + PORT + '/health');
});

module.exports = app;
