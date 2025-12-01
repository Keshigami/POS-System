import * as tf from '@tensorflow/tfjs';
import { prepareTimeSeriesData, normalizeData, denormalize, trainTestSplit, createTensors, calculateMetrics } from '../ml/dataset';
import * as fs from 'fs';
import * as path from 'path';

const MODEL_PATH = path.join(process.cwd(), 'models/forecasting');

/**
 * Create LSTM model for sales forecasting
 */
export function createForecastingModel(sequenceLength: number = 14): tf.LayersModel {
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
 * Train forecasting model on historical data
 */
export async function trainForecastingModel(
    productId: string,
    epochs: number = 100
): Promise<{ model: tf.LayersModel; metrics: any; history: any }> {
    console.log(`Training forecasting model for product ${productId}...`);

    // Prepare data
    const { xs, ys } = await prepareTimeSeriesData(productId, 60, 14);

    if (xs.length < 10) {
        throw new Error('Insufficient training data. Need at least 10 sequences.');
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
    const model = createForecastingModel(14);

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

    // Save model
    await saveModel(model, productId, { min: xMin, max: xMax, metrics });

    // Cleanup tensors
    xsTrainTensor.dispose();
    ysTrainTensor.dispose();
    xsTestTensor.dispose();
    ysTestTensor.dispose();
    predictions.dispose();

    console.log(`Training complete. MAE: ${metrics.mae}, RMSE: ${metrics.rmse}`);

    return { model, metrics, history: history.history };
}

/**
 * Load trained model from disk
 */
export async function loadForecastingModel(productId: string): Promise<{
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

    //Create directory if it doesn't exist
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
 * Make forecast prediction using trained model
 */
export async function predictSales(
    productId: string,
    daysAhead: number = 7
): Promise<{ predictions: number[]; confidence: number } | null> {
    const loaded = await loadForecastingModel(productId);

    if (!loaded) {
        console.log('No trained model found, train model first');
        return null;
    }

    const { model, metadata } = loaded;

    // Get recent sales data
    const { xs } = await prepareTimeSeriesData(productId, 30, 14);

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
        predictions.push(Math.max(0, Math.round(denormalizedPred)));

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
