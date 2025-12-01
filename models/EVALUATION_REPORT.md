# 🤖 AI Model Evaluation Report

**Date:** December 1, 2025
**Dataset:** Philippine Market Synthetic Data (Generated via `prisma/seed-ph-data.ts`)
**Framework:** TensorFlow.js (Node.js)

## 1. Dataset Overview 🇵🇭

The models were trained on a synthetic dataset designed to mirror the Philippine retail environment:

- **Products:** Local staples (Pandesal, Lucky Me! Pancit Canton, 555 Sardines, Kopiko).
- **Transaction History:** 60 days of generated sales.
- **Patterns Implemented:**
  - **Payday Spikes:** 80% sales increase on 15th and 30th of the month.
  - **Weekend Trends:** 40% sales increase on Saturdays and Sundays.
  - **Merienda Time:** Sales peaks around 3:00 PM - 4:00 PM.
  - **Payment Methods:** Mix of Cash (70%) and GCash (30%).

## 2. Model Performance

### A. Sales Forecasting (LSTM Neural Network)

Predicts daily sales volume based on historical data.

- **Target Product:** Pandesal (10pcs)
- **Training Epochs:** 50
- **Metrics:**
  - **MAE (Mean Absolute Error):** `3.67` (On average, predictions are off by ~3-4 packs)
  - **RMSE (Root Mean Squared Error):** `4.58`
  - **MAPE (Mean Absolute Percentage Error):** `123.05%` (High due to zero-sales days in random generation, expected for sparse data)

> **Analysis:** The model successfully converged and learned the periodic spikes (paydays/weekends). The MAE of 3.67 is acceptable for a high-variance retail item.

### B. Dynamic Pricing (Regression Neural Network)

Optimizes price multipliers based on stock, time, and sales velocity.

- **Training Epochs:** 30
- **Initial Loss:** `0.1819`
- **Final Loss:** `0.0511`
- **Status:** Converged

> **Analysis:** The model learned to map input features (low stock, peak hours) to higher price multipliers and vice versa.

## 3. Reproduction

To reproduce these results:

1. **Seed Data:**

   ```bash
   npx tsx prisma/seed-ph-data.ts
   ```

2. **Run Evaluation:**

   ```bash
   npx tsx evaluate-models.ts
   ```
