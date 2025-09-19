// Temporary mock service until Hyperledger Fabric is fully configured
class FabricService {
    constructor() {
        this.products = new Map();
        console.log('⚠️  Using mock fabric service. Configure real Hyperledger Fabric connection later.');
    }

    async invokeTransaction(contractName, transactionName, ...args) {
        console.log(`Mock invoke: ${transactionName}`, args);
        
        if (transactionName === 'createProduct') {
            const [productId, name, farmer, origin, harvestDate, quantity, price, qualityCertification] = args;
            const product = {
                id: productId,
                name,
                farmer,
                origin,
                harvestDate,
                quantity,
                price,
                qualityCertification,
                currentHolder: 'farmer',
                traceHistory: [{
                    timestamp: new Date().toISOString(),
                    actor: farmer,
                    action: 'CREATED',
                    location: origin
                }]
            };
            this.products.set(productId, product);
            return JSON.stringify(product);
        }
        
        if (transactionName === 'transferProduct') {
            const [productId, newHolder, location, action] = args;
            const product = this.products.get(productId);
            if (!product) throw new Error('Product not found');
            
            product.traceHistory.push({
                timestamp: new Date().toISOString(),
                actor: newHolder,
                action: action,
                location: location
            });
            product.currentHolder = newHolder;
            
            return JSON.stringify(product);
        }
        
        throw new Error('Transaction not implemented');
    }

    async queryTransaction(contractName, transactionName, ...args) {
        console.log(`Mock query: ${transactionName}`, args);
        
        if (transactionName === 'queryProduct') {
            const [productId] = args;
            const product = this.products.get(productId);
            if (!product) throw new Error('Product not found');
            return JSON.stringify(product);
        }
        
        if (transactionName === 'queryAllProducts') {
            const allProducts = Array.from(this.products.values());
            return JSON.stringify(allProducts);
        }
        
        if (transactionName === 'getTraceHistory') {
            const [productId] = args;
            const product = this.products.get(productId);
            if (!product) throw new Error('Product not found');
            return JSON.stringify(product.traceHistory);
        }
        
        throw new Error('Query not implemented');
    }
}

module.exports = new FabricService();
