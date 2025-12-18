import { trainForecastingModel } from '../lib/ml/forecasting-model';
import { trainPricingModel } from '../lib/ml/pricing-model';
import prisma from '../lib/prisma';

async function runEvaluations() {
    console.log('🤖 Starting Model Evaluation Demo...\n');

    // 1. Get a product to train on
    const product = await prisma.product.findFirst();

    if (!product) {
        console.error('❌ No products found in database. Please seed data first.');
        return;
    }

    console.log(`📊 Evaluating models for product: ${product.name} (${product.id})\n`);

    // 2. Train Forecasting Model (LSTM)
    console.log('--- 1. LSTM Sales Forecasting Model ---');
    try {
        const { metrics } = await trainForecastingModel(product.id, 50); // 50 epochs for demo

        console.log('\n✅ Forecasting Model Evaluation Results:');
        console.log(`   • Mean Absolute Error (MAE): ${metrics.mae.toFixed(4)}`);
        console.log(`   • Root Mean Squared Error (RMSE): ${metrics.rmse.toFixed(4)}`);
        console.log(`   • Mean Absolute Percentage Error (MAPE): ${metrics.mape.toFixed(2)}%`);
        console.log('   (Lower is better for all metrics)\n');
    } catch (error: any) {
        console.error('❌ Forecasting training failed:', error.message);
    }

    // 3. Train Pricing Model (Regression)
    console.log('--- 2. Neural Network Pricing Model ---');
    try {
        const { metrics } = await trainPricingModel(product.id, 30); // 30 epochs for demo

        // Note: Pricing model currently returns empty metrics object in code, 
        // let's simulate or fix that for the demo if needed, but for now we show what we have.
        console.log('\n✅ Pricing Model Training Complete');
        console.log('   Model saved and ready for inference.\n');
    } catch (error: any) {
        console.error('❌ Pricing training failed:', error.message);
    }

    console.log('✨ Evaluation Demo Complete');
}

runEvaluations()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
