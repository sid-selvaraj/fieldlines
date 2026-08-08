---
title: "PyTorch Time-Series Forecasting: Concepts and Implementation"
date: 2026-07-23
status: "Published"
abstract: "Technical reference for LSTM-based stock price prediction. Covers data normalization, tensor shapes, training loops, and PyTorch mechanics for recurrent neural networks."
tags: [PyTorch, LSTM, time series, machine learning, neural networks]
---

## Part 1: Data & Machine Learning Fundamentals

### 1. Standard Scaling

Normalizes data to a mean of 0 and standard deviation of 1, preventing large values (e.g., stock prices) from destabilizing neural network training. Mathematically:

$$x_{\text{scaled}} = \frac{x - \mu}{\sigma}$$

where $\mu$ is the mean and $\sigma$ is the standard deviation. This ensures gradients during backpropagation remain in a stable range.

### 2. Arrays vs. Tensors

- **Array:** A multi-dimensional grid of numbers (NumPy), stored in CPU memory
- **Tensor:** The PyTorch equivalent, optimized for GPU processing and automatic gradient tracking

Tensors are the fundamental data structure for neural networks. They automatically track computational dependencies for backpropagation.

### 3. Train-Test Split

Splits time-series data chronologically:

- **Train (80%):** Data used to fit model weights
- **Test (20%):** Unseen future data used to evaluate real-world performance

*Critical for time series:* splits must be chronological, never randomized, to prevent data leakage (training on data from the "future").

### 4. Input Tensor Shape

Formats sequences into `(Batch Size, Sequence Length, Features)` as required by PyTorch recurrent layers:

- **Batch Size:** Number of independent sequences processed simultaneously
- **Sequence Length:** Number of timesteps in each sequence (e.g., 30 days)
- **Features:** Number of input variables per timestep (e.g., 1 for univariate price data)

## Part 2: Neural Networks & LSTM Concepts

### 5. LSTM States

LSTMs maintain two types of state across timesteps:

- **Cell State ($c_t$):** Long-term memory highway carrying information across many sequence steps without modification
- **Hidden State ($h_t$):** Short-term memory used for immediate predictions and passed to the next timestep

These states are initialized to zero at the start of each sequence:

```python
h0 = torch.zeros(num_layers, batch_size, hidden_dim)
c0 = torch.zeros(num_layers, batch_size, hidden_dim)
```

### 6. Linear Layer

A fully connected layer (`nn.Linear`) mapping the final LSTM hidden state to a single continuous output value. For price prediction:

```python
self.fc = nn.Linear(hidden_dim, output_dim)
```

This layer learns a linear transformation: $\text{output} = W \cdot h_T + b$

### 7. Adam Optimizer

An adaptive optimization algorithm that iteratively updates model weights to minimize loss. Benefits include:

- **Adaptive learning rates** per parameter
- **Momentum** for faster convergence
- **Bias correction** in early iterations

Learning rate (typically 0.001-0.01) controls step size; lower rates are more stable but converge slower.

### 8. Epochs

One complete iteration over the entire training dataset. A typical training run uses 50-500 epochs depending on dataset size and complexity.

### 9. Evaluation & Post-Processing

- **Evaluation:** Runs model inference (`model.eval()`) on unseen test data with weight updates disabled via `torch.no_grad()`
- **Post-Processing:** Applies `scaler.inverse_transform()` to convert normalized predictions back to real dollar values
- **Metrics:** Computes performance metrics like RMSE (Root Mean Squared Error):

$$\text{RMSE} = \sqrt{\frac{1}{n}\sum_i (y_i - \hat{y}_i)^2}$$

## Part 3: PyTorch Mechanics

### 10. Computational Graph (DAG)

PyTorch builds a **Directed Acyclic Graph** dynamically during forward pass:

- Each operation (addition, multiplication, LSTM cell, linear layer) becomes a node
- Edges represent data flow between operations
- At backward pass, the graph is traversed to compute gradients

This dynamic computation graph allows flexible architectures that adapt to input shapes.

### 11. Autograd (torch.autograd)

PyTorch's **automatic differentiation** engine. Executes calculus chain rules via `loss.backward()` to compute gradients efficiently:

$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial h} \cdot \frac{\partial h}{\partial w}$$

Gradients are accumulated in the `.grad` attribute of each parameter.

### 12. nn.Module

The base class for all neural networks. Provides:

- Parameter tracking (automatically registered when creating layers)
- `.to(device)` to transfer model to CPU/GPU
- `.eval()` and `.train()` to toggle dropout/batch norm behavior
- `.parameters()` iterator for optimization

### 13. Tensor Methods

Key operations:

- **`.to(device)`:** Transfers tensors between CPU and GPU RAM
- **`.detach()`:** Decouples tensors from the computational graph to stop gradient tracking (used for inference)
- **`.cpu().numpy()`:** Converts PyTorch tensors back to NumPy arrays
- **`.clone()`:** Creates a deep copy of a tensor

### 14. Dataset & DataLoader

- **Dataset:** Custom class storing samples and labels, implementing `__getitem__` and `__len__`
- **DataLoader:** Handles batching, shuffling, and loading data into training loops efficiently

For small datasets, manual batching in a loop is simpler than custom DataLoaders.

## Application: Stock Price Prediction

The LSTM model takes sequences of normalized stock prices and predicts the next day's price. The 80/20 train-test split ensures the model is evaluated on genuinely unseen future data. After training minimizes MSE loss, the model's predictions are inverse-transformed to recover dollar values, then compared against actual test prices using RMSE.

This framework generalizes to any univariate time-series forecasting problem: weather, demand, sensor data, etc.
