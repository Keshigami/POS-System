import * as tf from '@tensorflow/tfjs';
import { getInteractionMatrix, normalizeInteraction } from './interaction-tracker';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Collaborative Filtering using Matrix Factorization
 * Learns user and product embeddings to predict user-product affinity
 */

const EMBEDDING_DIM = 20;
const MODEL_DIR = path.join(process.cwd(), 'models', 'recommendations');

interface TrainingData {
    userIndices: number[];
    productIndices: number[];
    ratings: number[];
    userIndexMap: Map<string, number>;
    productIndexMap: Map<string, number>;
    reverseUserMap: Map<number, string>;
    reverseProductMap: Map<number, string>;
}

/**
 * Build the collaborative filtering model
 */
function buildRecommendationModel(numUsers: number, numProducts: number): tf.LayersModel {
    // User input
    const userInput = tf.input({ shape: [1], name: 'user_input', dtype: 'int32' });

    // Product input
    const productInput = tf.input({ shape: [1], name: 'product_input', dtype: 'int32' });

    // User embedding layer
    const userEmbedding = tf.layers.embedding({
        inputDim: numUsers,
        outputDim: EMBEDDING_DIM,
        name: 'user_embedding',
    }).apply(userInput) as tf.SymbolicTensor;

    // Product embedding layer
    const productEmbedding = tf.layers.embedding({
        inputDim: numProducts,
        outputDim: EMBEDDING_DIM,
        name: 'product_embedding',
    }).apply(productInput) as tf.SymbolicTensor;

    // Flatten embeddings
    const userFlat = tf.layers.flatten().apply(userEmbedding) as tf.SymbolicTensor;
    const productFlat = tf.layers.flatten().apply(productEmbedding) as tf.SymbolicTensor;

    // Dot product for similarity
    const dotProduct = tf.layers.dot({ axes: 1 }).apply([userFlat, productFlat]) as tf.SymbolicTensor;

    // Activation to get rating prediction
    const output = tf.layers.dense({ units: 1, activation: 'sigmoid', name: 'output' })
        .apply(dotProduct) as tf.SymbolicTensor;

    const model = tf.model({
        inputs: [userInput, productInput],
        outputs: output,
        name: 'collaborative_filtering',
    });

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mae'],
    });

    return model;
}

/**
 * Prepare training data from interaction matrix
 */
async function prepareInteractionData(): Promise<TrainingData> {
    const { interactions, userIds, productIds } = await getInteractionMatrix();

    // Create index mappings
    const userIndexMap = new Map<string, number>();
    const productIndexMap = new Map<string, number>();
    const reverseUserMap = new Map<number, string>();
    const reverseProductMap = new Map<number, string>();

    userIds.forEach((userId, index) => {
        userIndexMap.set(userId, index);
        reverseUserMap.set(index, userId);
    });

    productIds.forEach((productId, index) => {
        productIndexMap.set(productId, index);
        reverseProductMap.set(index, productId);
    });

    // Build training arrays
    const userIndices: number[] = [];
    const productIndices: number[] = [];
    const ratings: number[] = [];

    for (const interaction of interactions) {
        const userIdx = userIndexMap.get(interaction.userId);
        const productIdx = productIndexMap.get(interaction.productId);

        if (userIdx !== undefined && productIdx !== undefined) {
            userIndices.push(userIdx);
            productIndices.push(productIdx);
            ratings.push(normalizeInteraction(interaction.quantity));
        }
    }

    return {
        userIndices,
        productIndices,
        ratings,
        userIndexMap,
        productIndexMap,
        reverseUserMap,
        reverseProductMap,
    };
}

/**
 * Train the collaborative filtering model
 */
export async function trainModel(epochs = 50): Promise<{
    success: boolean;
    metrics?: any;
    error?: string;
}> {
    try {
        console.log('📊 Preparing interaction data...');
        const trainingData = await prepareInteractionData();

        if (trainingData.userIndices.length < 50) {
            return {
                success: false,
                error: 'Insufficient data: Need at least 50 interactions',
            };
        }

        console.log(`✅ Loaded ${trainingData.userIndices.length} interactions`);
        console.log(`   Users: ${trainingData.userIndexMap.size}`);
        console.log(`   Products: ${trainingData.productIndexMap.size}`);

        // Build model
        const model = buildRecommendationModel(
            trainingData.userIndexMap.size,
            trainingData.productIndexMap.size
        );

        // Prepare tensors
        const userTensor = tf.tensor2d(trainingData.userIndices.map(i => [i]));
        const productTensor = tf.tensor2d(trainingData.productIndices.map(i => [i]));
        const ratingTensor = tf.tensor2d(trainingData.ratings.map(r => [r]));

        // Train
        console.log('🚀 Training collaborative filtering model...');
        const history = await model.fit(
            [userTensor, productTensor],
            ratingTensor,
            {
                epochs,
                batchSize: 32,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 10 === 0) {
                            console.log(`   Epoch ${epoch}: loss=${logs?.loss.toFixed(4)}, val_loss=${logs?.val_loss?.toFixed(4)}`);
                        }
                    },
                },
            }
        );

        // Clean up tensors
        userTensor.dispose();
        productTensor.dispose();
        ratingTensor.dispose();

        // Save model
        if (!fs.existsSync(MODEL_DIR)) {
            fs.mkdirSync(MODEL_DIR, { recursive: true });
        }

        await model.save(`file://${MODEL_DIR}`);

        // Save index mappings
        const mappings = {
            userIndexMap: Array.from(trainingData.userIndexMap.entries()),
            productIndexMap: Array.from(trainingData.productIndexMap.entries()),
            numUsers: trainingData.userIndexMap.size,
            numProducts: trainingData.productIndexMap.size,
            trainingDate: new Date().toISOString(),
        };

        fs.writeFileSync(
            path.join(MODEL_DIR, 'mappings.json'),
            JSON.stringify(mappings, null, 2)
        );

        const finalLoss = history.history.loss[history.history.loss.length - 1] as number;
        const finalValLoss = history.history.val_loss?.[history.history.val_loss.length - 1] as number;

        console.log('✅ Model trained and saved!');

        return {
            success: true,
            metrics: {
                finalLoss: finalLoss.toFixed(4),
                finalValLoss: finalValLoss?.toFixed(4),
                interactions: trainingData.userIndices.length,
                users: trainingData.userIndexMap.size,
                products: trainingData.productIndexMap.size,
            },
        };
    } catch (error) {
        console.error('❌ Training failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get personalized recommendations for a user
 */
export async function getRecommendations(
    userId: string,
    topN = 5
): Promise<{ productId: string; score: number }[]> {
    try {
        // Load model and mappings
        const modelPath = `file://${MODEL_DIR}`;
        const model = await tf.loadLayersModel(`${modelPath}/model.json`);

        const mappingsPath = path.join(MODEL_DIR, 'mappings.json');
        const mappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf-8'));

        const userIndexMap = new Map(mappings.userIndexMap);
        const productIndexMap = new Map(mappings.productIndexMap);

        // Get user index
        const userIdx = userIndexMap.get(userId);
        if (userIdx === undefined) {
            // Cold start - return empty (caller will use fallback)
            return [];
        }

        // Predict scores for all products
        const productIndices = Array.from(productIndexMap.values()) as number[];
        const userIndices = new Array(productIndices.length).fill(userIdx) as number[];

        const userTensor = tf.tensor2d(userIndices.map(i => [i]));
        const productTensor = tf.tensor2d(productIndices.map(i => [i]));

        const predictions = model.predict([userTensor, productTensor]) as tf.Tensor;
        const scores = await predictions.data();

        // Clean up
        userTensor.dispose();
        productTensor.dispose();
        predictions.dispose();

        // Map back to product IDs with scores
        const recommendations = Array.from(productIndexMap.entries())
            .map(([productId, idx]: any) => ({
                productId: productId as string,
                score: scores[idx] as number,
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN);

        return recommendations;
    } catch (error) {
        console.error('Failed to generate recommendations:', error);
        return [];
    }
}

/**
 * Check if collaborative filtering model exists
 */
export function modelExists(): boolean {
    const modelPath = path.join(MODEL_DIR, 'model.json');
    return fs.existsSync(modelPath);
}
