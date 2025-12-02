import * as tf from '@tensorflow/tfjs';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const MODEL_PATH = path.join(process.cwd(), 'models/cost-forecasting');

/**
 * Prepare time-series data from cost price history
 */
async function prepareCostHistoryData(
    productId: string,
    lookbackDays: number = 60,
    sequenceLength: number = 14
): Promise<{ xs: number[][]; ys: number[] }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

    const costHistory = await prisma.costPriceHistory.findMany({
        where: {
            productId,
            recordedAt: { gte: cutoffDate },
        },
        orderBy: { recordedAt: 'asc' },
    });

    if (costHistory.length < sequenceLength + 1) {
        return { xs: [], ys: [] };
    }

    const prices = costHistory.map((h) => h.costPrice);
    const xs: number[][] = [];
    const ys: number[] = [];

    for (let i = 0; i <= prices.length - sequenceLength - 1; i++) {
        xs.push(prices.slice(i, i + sequenceLength));
        ys.push(prices[i + sequenceLength]);
    }

    return { xs, ys };
}

/**
 * Normalize data to [0, 1] range
 */
function normalizeData(data: number[][]): {
    normalized: number[][];
    min: number;
    max: number;
} {
    const flat = data.flat();
    const min = Math.min(...flat);
    const max = Math.max(...flat);
    const range = max - min || 1;

    const normalized = data.map((seq) => seq.map((val) => (val - min) / range));

    return { normalized, min, max };
}

/**
 * Denormalize a value
 */
function denormalize(value: number, min: number, max: number): number {
    return value * (max - min) + min;
}

/**
 * Train/test split
 */
function trainTestSplit<T>(data: T[], testRatio: number = 0.2): { train: T[]; test: T[] } {
    const splitIndex = Math.floor(data.length * (1 - testRatio));
    return {
        train: data.slice(0, splitIndex),
        test: data.slice(splitIndex),
    };
}

/**
 * Calculate evaluation metrics
 */
function calculateMetrics(predictions: number[], actuals: number[]): {
    mae: number;
    rmse: number;
    mape: number;
} {
    const n = predictions.length;
    let sumAE = 0;
    let sumSE = 0;
    let sumAPE = 0;

    for (let i = 0; i < n; i++) {
        const error = Math.abs(predictions[i] - actuals[i]);
        sumAE += error;
        sumSE += error ** 2;
        sumAPE += actuals[i] !== 0 ? (error / Math.abs(actuals[i])) * 100 : 0;
    }

    return {
        mae: sumAE / n,
        rmse: Math.sqrt(sumSE / n),
        mape: sumAPE / n,
    };
}

/**
 * Create LSTM model for cost price forecasting
 */
export function createCostForecastingModel(sequenceLength: number = 14): tf.LayersModel {
    const model = tf.sequential();

    // LSTM layer
    model.add(tf.layers.lstm({
        units: 32,
        returnSequences: false,
        inputShape: [sequenceLength, 1],
    }));

    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Dense hidden layer
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

    // Output layer
    model.add(tf.layers.dense({ units: 1 }));

    // Compile model
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
    });

    return model;
}

/**
 * Train cost forecasting model on historical data
 */
export async function trainCostForecastingModel(
    productId: string,
    epochs: number = 100
): Promise<{ model: tf.LayersModel; metrics: any; history: any }> {
    console.log(`Training cost forecasting model for product ${productId}...`);

    // Prepare data
    const { xs, ys } = await prepareCostHistoryData(productId, 60, 14);

    if (xs.length < 10) {
        throw new Error('Insufficient training data. Need at least 10 cost price records.');
    }

    // Normalize
    const { normalized: normalizedXs, min: xMin, max: xMax } = normalizeData(xs);
    const normalizedYs = ys.map(y => (y - xMin) / (xMax - xMin || 1));

    // Train/test split
    const { train: xsTrain, test: xsTest } = trainTestSplit(normalizedXs);
    const { train: ysTrain, test: ysTest } = trainTestSplit(normalizedYs);

    // Create tensors
    const xsTrainTensor = tf.tensor3d(xsTrain.map((x) => x.map((v) => [v])));
    const ysTrainTensor = tf.tensor2d(ysTrain, [ysTrain.length, 1]);
    const xsTestTensor = tf.tensor3d(xsTest.map((x) => x.map((v) => [v])));
    const ysTestTensor = tf.tensor2d(ysTest, [ysTest.length, 1]);

    // Create model
    const model = createCostForecastingModel(14);

    // Train with early stopping
    const history = await model.fit(xsTrainTensor, ysTrainTensor, {
        epochs,
        validationData: [xsTestTensor, ysTestTensor],
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                if (epoch % 20 === 0) {
                    console.log(`Epoch ${epoch}: loss = ${logs?.loss.toFixed(4)}, val_loss = ${logs?.val_loss.toFixed(4)}`);
                }
            },
        },
    });

    // Evaluate
    const predictions = model.predict(xsTestTensor) as tf.Tensor;
    const predArray = Array.from(await predictions.data());
    const denormalizedPreds = predArray.map(p => denormalize(p, xMin, xMax));
    const denormalizedActuals = ysTest.map(y => denormalize(y, xMin, xMax));

    const metrics = calculateMetrics(denormalizedPreds, denormalizedActuals);

    // Save model (attempt)
    try {
        await saveModel(model, productId, { min: xMin, max: xMax, metrics });
    } catch (error: any) {
        console.warn(`⚠️ Could not save model to disk: ${error.message}`);
        console.log('Continuing with in-memory model...');
    }

    // Cleanup tensors
    xsTrainTensor.dispose();
    ysTrainTensor.dispose();
    xsTestTensor.dispose();
    ysTestTensor.dispose();
    predictions.dispose();

    console.log(`Training complete. MAE: ${metrics.mae.toFixed(2)}, RMSE: ${metrics.rmse.toFixed(2)}`);

    return { model, metrics, history: history.history };
}

/**
 * Load trained model from disk
 */
export async function loadCostForecastingModel(productId: string): Promise<{
    model: tf.LayersModel;
    metadata: any;
} | null> {
    try {
        const modelPath = `file://${MODEL_PATH}/${productId}/model.json`;
        const metadataPath = path.join(MODEL_PATH, productId, 'metadata.json');

        if (!fs.existsSync(metadataPath)) {
            return null;
        }

        const model = await tf.loadLayersModel(modelPath);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        return { model, metadata };
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

/**
 * Save model to disk
 */
async function saveModel(
    model: tf.LayersModel,
    productId: string,
    metadata: any
): Promise<void> {
    const modelDir = path.join(MODEL_PATH, productId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
    }

    // Save model
    await model.save(`file://${modelDir}`);

    // Save metadata
    fs.writeFileSync(
        path.join(modelDir, 'metadata.json'),
        JSON.stringify({
            ...metadata,
            trainedAt: new Date().toISOString(),
            productId,
        }, null, 2)
    );
}

/**
 * Make cost price forecast prediction using trained model
 */
export async function predictCostPrices(
    productId: string,
    daysAhead: number = 30
): Promise<{ predictions: number[]; confidence: number } | null> {
    const loaded = await loadCostForecastingModel(productId);

    if (!loaded) {
        console.log('No trained model found, train model first');
        return null;
    }

    const { model, metadata } = loaded;

    // Get recent cost price data
    const { xs } = await prepareCostHistoryData(productId, 30, 14);

    if (xs.length === 0) {
        return null;
    }

    // Use last sequence for prediction
    const lastSequence = xs[xs.length - 1];
    const { normalized } = normalizeData([lastSequence]);

    const predictions: number[] = [];
    let currentSequence = normalized[0];

    // Iterative prediction
    for (let i = 0; i < daysAhead; i++) {
        const inputTensor = tf.tensor3d([currentSequence.map(v => [v])]);
        const predTensor = model.predict(inputTensor) as tf.Tensor;
        const predValue = (await predTensor.data())[0];

        // Denormalize
        const denormalizedPred = denormalize(
            predValue,
            metadata.min,
            metadata.max
        );
        predictions.push(Math.max(0, Number(denormalizedPred.toFixed(2))));

        // Update sequence for next prediction
        currentSequence = [...currentSequence.slice(1), predValue];

        inputTensor.dispose();
        predTensor.dispose();
    }

    // Confidence from training metrics
    const confidence = Math.max(0.3, 1 - (metadata.metrics.mape / 100));

    return {
        predictions,
        confidence: Number(confidence.toFixed(2)),
    };
}
