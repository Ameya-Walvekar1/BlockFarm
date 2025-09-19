'use strict';

const { Contract } = require('fabric-contract-api');

class FarmTraceContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const products = [
            {
                id: 'PRODUCT1',
                name: 'Organic Tomatoes',
                farmer: 'John Doe Farm',
                origin: 'California, USA',
                harvestDate: '2025-09-01',
                quantity: '100kg',
                price: '$50',
                qualityCertification: 'Organic Certified',
                currentHolder: 'farmer'
            }
        ];

        for (let i = 0; i < products.length; i++) {
            products[i].docType = 'product';
            await ctx.stub.putState('PRODUCT' + i, Buffer.from(JSON.stringify(products[i])));
            console.info('Added <--> ', products[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async createProduct(ctx, productId, name, farmer, origin, harvestDate, quantity, price, qualityCertification) {
        console.info('============= START : Create Product ===========');

        const product = {
            id: productId,
            docType: 'product',
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

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        console.info('============= END : Create Product ===========');
        return JSON.stringify(product);
    }

    async queryProduct(ctx, productId) {
        const productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`${productId} does not exist`);
        }
        console.log(productAsBytes.toString());
        return productAsBytes.toString();
    }

    async transferProduct(ctx, productId, newHolder, location, action) {
        console.info('============= START : Transfer Product ===========');

        const productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`${productId} does not exist`);
        }
        const product = JSON.parse(productAsBytes.toString());

        // Add to trace history
        product.traceHistory.push({
            timestamp: new Date().toISOString(),
            actor: newHolder,
            action: action,
            location: location
        });

        product.currentHolder = newHolder;

        await ctx.stub.putState(productId, Buffer.from(JSON.stringify(product)));
        console.info('============= END : Transfer Product ===========');
        return JSON.stringify(product);
    }

    async getTraceHistory(ctx, productId) {
        const productAsBytes = await ctx.stub.getState(productId);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`${productId} does not exist`);
        }
        const product = JSON.parse(productAsBytes.toString());
        return JSON.stringify(product.traceHistory);
    }

    async queryAllProducts(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
}

module.exports = FarmTraceContract;
