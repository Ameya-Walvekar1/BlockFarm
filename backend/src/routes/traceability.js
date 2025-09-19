const express = require('express');
const router = express.Router();
const traceabilityController = require('../controllers/traceabilityController');

// Routes
router.get('/:productId', traceabilityController.getProductTrace);
router.get('/:productId/verify', traceabilityController.verifyProduct);

module.exports = router;
