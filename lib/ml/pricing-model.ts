import * as tf from '@tensorflow/tfjs';
import { preparePricingFeatures, normalizeData, denormalize } from '../ml/dataset';
import * as fs from 'fs';
import * as path from 'path';

const MODEL_PATH = path.join(process.cwd(), 'models/pricing');

/**
 * Create neural network for price optimization
 */
export function createPricingModel(inputFeatures: number = 4): tf.LayersModel {
    const model = tf.sequential();

    // Input layer + hidden layer
    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
        inputShape: [inputFeatures],
    }));

    // Dropout
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Hidden layer
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
    }));

    // Output layer (price multiplier)
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
    });

    return model;
}

/**
 * Train pricing model
 */
export async function trainPricingModel(
    productId: string,
    epochs: number = 50
): Promise<{ model: tf.LayersModel; metrics: any }> {
    console.log(`Training pricing model for product ${productId}...`);

    const { features, prices } = await preparePricingFeatures(productId, 30);

    if (features.length < 10) {
        throw new Error('Insufficient training data for pricing model.');
    }

    // Create tensors
    const xsTensor = tf.tensor2d(features);
    const ysTensor = tf.tensor2d(prices, [prices.length, 1]);

    // Train model
    const model = createPricingModel(features[0].length);

    await model.fit(xsTensor, ysTensor, {
        epochs,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 10 === 0) {
                    console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}`);
                }
            },
        },
    });

    // Save model
    const modelDir = path.join(MODEL_PATH, productId);
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    await model.save(`file://${modelDir}`);
    fs.writeFileSync(
        path.join(modelDir, 'metadata.json'),
        JSON.stringify({
            trainedAt: new Date().toISOString(),
            productId,
            inputFeatures: features[0].length,
        }, null, 2)
    );

    xsTensor.dispose();
    ysTensor.dispose();

    console.log('Pricing model training complete');

    return { model, metrics: {} };
}

/**
 * Predict optimal price multiplier
 */
export async function predictOptimalPrice(
    productId: string,
    currentFeatures: number[]
): Promise<number | null> {
    try {
        const modelPath = `file://${MODEL_PATH}/${productId}/model.json`;
        const model = await tf.loadLayersModel(modelPath);

        const inputTensor = tf.tensor2d([currentFeatures]);
        const prediction = model.predict(inputTensor) as tf.Tensor;
        const multiplier = (await prediction.data())[0];

        inputTensor.dispose();
        prediction.dispose();

        // Clamp between 0.8 and 1.3
        return Math.max(0.8, Math.min(1.3, multiplier));
    } catch (error) {
        console.error('Error predicting price:', error);
        return null;
    }
}
