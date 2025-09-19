const fabricService = require('../services/fabricService');

class TraceabilityController {
    async getProductTrace(req, res) {
        try {
            const { productId } = req.params;
            
            const traceHistory = await fabricService.queryTransaction(
                'farmtrace', 
                'getTraceHistory', 
                productId
            );

            res.json({
                success: true,
                data: JSON.parse(traceHistory)
            });
        } catch (error) {
            console.error('Error getting trace history:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get trace history',
                error: error.message
            });
        }
    }

    async verifyProduct(req, res) {
        try {
            const { productId } = req.params;
            
            const product = await fabricService.queryTransaction(
                'farmtrace', 
                'queryProduct', 
                productId
            );

            res.json({
                success: true,
                verified: true,
                data: JSON.parse(product)
            });
        } catch (error) {
            console.error('Error verifying product:', error);
            res.status(404).json({
                success: false,
                verified: false,
                message: 'Product not found or verification failed',
                error: error.message
            });
        }
    }
}

module.exports = new TraceabilityController();
