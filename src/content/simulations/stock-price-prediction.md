---
title: "LSTM Stock Price Prediction"
date: 2026-07-26
description: "An LSTM neural network trained on historical AAPL stock prices to forecast future closing prices. Explore time-series forecasting with PyTorch."
tags: [LSTM, neural networks, time series, PyTorch, machine learning]
---

## Overview

This simulation implements an LSTM (Long Short Term Memory) neural network using PyTorch to forecast Apple (AAPL) stock prices. It frames the time-series forecasting problem as a supervised learning task using a sliding window approach over historical daily closing prices.

## Data Ingestion

**Sourcing:** Historical daily closing prices fetched using yfinance

**Normalization:** Applies StandardScaler to the Close prices to achieve zero mean and unit variance. This is crucial for stabilizing gradients during backpropagation in recurrent networks—large price values can cause exploding or vanishing gradients.

**Sequencing:** Converts 1D price arrays into 3D tensors `(batch_size, seq_length, features)` using a sequence length of 30 days. The model looks at 29 days of history to predict the 30th day's price.

**Splitting:** Performs a chronological 80/20 train-test split to prevent data leakage in time-series data (never randomize time-series splits). Casts the arrays to GPU-enabled PyTorch tensors for efficient computation.

## Model Architecture

**Stacked LSTM:** Uses 2 LSTM layers, each with 32 hidden units, taking univariate time-series sequences as input. Stacking enables learning of hierarchical temporal patterns.

**State Reset:** Zero initializes hidden and cell states per forward pass to prevent information bleeding across batches.

**Linear Head:** Maps the final LSTM hidden state to a single continuous prediction via `nn.Linear(hidden_dim=32, output_dim=1)`. This fully connected layer learns a linear transformation of the learned temporal features.

## Training Loop

**Optimization:** Uses Adam optimizer with learning rate 0.02, minimizing MSE (Mean Squared Error) loss over 200 epochs. Adam adapts the learning rate per parameter, enabling faster convergence.

**Execution:** Standard PyTorch autograd cycle:
1. Forward pass through LSTM
2. Compute loss
3. Zero gradients
4. Backward pass (loss.backward())
5. Update weights (optimizer.step())

## Evaluation and Validation

**Inference:** Sets `model.eval()` to disable dropout/batch norm, detaches tensors to CPU, and applies `scaler.inverse_transform()` to convert normalized predictions back to USD currency.

**Metrics:** Computes RMSE (Root Mean Squared Error) separately on train and test splits:

$$\text{RMSE} = \sqrt{\frac{1}{n}\sum_i (y_i - \hat{y}_i)^2}$$

This tells us the average magnitude of prediction errors in dollar terms.

## Visualization

Uses custom `matplotlib.gridspec` layout with:
- **Top subplot:** Overlays actual vs. predicted test prices to visualize accuracy
- **Bottom subplot:** Shows absolute prediction error over time, with a horizontal line at test RMSE for reference

This helps identify whether errors cluster at certain time periods or are randomly distributed.

## Key Insights

**Why LSTM?** Unlike feedforward networks, LSTMs have memory via recurrent connections and gating mechanisms. The cell state allows information to flow unchanged across many timesteps, while the forget gate learns which information to discard. This makes LSTMs particularly suited for time series where recent history matters.

**Why normalization?** Stock prices often range in the hundreds; raw values create large gradients that destabilize training. Normalizing to $\mu=0, \sigma=1$ centers data and bounds gradients, enabling stable learning.

**Train-test timing:** The train set uses earlier dates; the test set uses later dates. This mimics real forecasting where you predict the future, not the past.

## Generalization

This framework extends to any univariate time-series: weather prediction, sensor data, demand forecasting, etc. The key components (normalization, sliding windows, LSTM, inverse transform, RMSE evaluation) remain the same regardless of domain.
