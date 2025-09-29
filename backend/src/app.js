const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const os = require('os');
require('dotenv').config();

const app = express();
// --- Manual CORS Middleware (no external package needed) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // allow all domains
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  // intercept OPTIONS method for preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Get local IP address for QR codes
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

// Make IP available globally for QR code service
global.SERVER_IP = localIP;
global.SERVER_PORT = PORT;

// Middleware
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

// Routes
const routes = require('./routes');
app.use('/api', routes);

app.post('/api/farmer/product/create', async (req, res) => {
  try {
    const { id, name, description } = req.body; // Adjust fields as needed

    // Connect to blockchain contract (implement as per your blockchain setup)
    const contract = await connectToBlockchain();

    // Submit create product transaction
    await contract.submitTransaction('CreateProduct', id, name, description);

    // Construct QR code data (e.g., verification URL)
    const qrData = `http://3.110.122.11:3001/verify/${id}`;

    // Respond with product info and QR data
    res.json({
      success: true,
      product: { id, name, description },
      qrCodeData: qrData,
      message: 'Product created and QR code generated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Health check
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
                'http://localhost:' + '3001',
                'http://' + localIP + ':' + '3001'
            ]
        }
    });
});

// QR Code verification endpoint for mobile devices
app.get('/verify/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const currentTime = new Date().toLocaleString();
        
        // Simple HTML response
        const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FarmTrace - Product Verification</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    background: #f5f5f5;
                    color: #333;
                }
                .container { 
                    background: white; 
                    padding: 20px; 
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .verified { color: #28a745; font-weight: bold; }
                .product-info { margin: 15px 0; }
                h1 { color: #28a745; }
                .qr-success { background: #d4edda; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="qr-success">
                    ✅ <strong>QR Code Successfully Scanned!</strong>
                </div>
                
                <h1>🌾 FarmTrace Verification</h1>
                
                <div class="product-info">
                    <h2 class="verified">✓ Product Verified</h2>
                    <p><strong>Product ID:</strong> ${productId}</p>
                    <p><strong>Status:</strong> ✅ Mobile QR scanning is working!</p>
                    <p><strong>Network:</strong> Successfully connected to server</p>
                    <p><strong>Timestamp:</strong> ${currentTime}</p>
                    <p><strong>Server IP:</strong> ${localIP}:${PORT}</p>
                </div>
                
                <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3>🎉 Congratulations!</h3>
                    <p>Your mobile device successfully scanned the QR code and connected to the FarmTrace backend server.</p>
                    <p><strong>Connection:</strong> Same WiFi Network</p>
                </div>
                
                <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                    Powered by FarmTrace Blockchain Technology
                </footer>
            </div>
        </body>
        </html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Verification error:', error);
        res.status(404).send('<h1>Error: Product not found</h1>');
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Listen on all interfaces to allow mobile access
app.listen(PORT, HOST, () => {
    console.log('🚀 FarmTrace Backend Server running on ' + HOST + ':' + PORT);
    console.log('🌐 Health check: http://' + localIP + ':' + PORT + '/health');
    console.log('📱 Mobile access: http://' + localIP + ':' + PORT);
    console.log('🔗 Local access: http://localhost:' + PORT);
    console.log('\n📋 Network Information:');
    console.log('   - Make sure mobile device is on same WiFi network');
    console.log('   - Mobile QR codes will use: http://' + localIP + ':' + PORT + '/verify/PRODUCT_ID');
    console.log('   - Test mobile connection: http://' + localIP + ':' + PORT + '/health');
});

module.exports = app;
