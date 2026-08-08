# Converted from stockprice.ipynb
# All notebook code cells combined into one Python file

# Cell 1
import subprocess
import sys

subprocess.check_call([sys.executable, "-m", "pip", "install", "numpy", "pandas", "matplotlib", "yfinance", "scikit-learn", "torch"])

# Cell 2
import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt

import torch
import torch.nn as nn
import torch.optim as optim

from sklearn.preprocessing import StandardScaler
from sklearn.metrics import root_mean_squared_error

# Cell 3
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Cell 4
ticker = 'AAPL'
df = yf.download(ticker, '2020-01-01')

# Cell 5
df.Close.plot()

# Cell 6
scaler = StandardScaler()
df['Close'] = scaler.fit_transform(df[['Close']])

# Cell 7
df.Close

# Cell 8
seq_length = 30
data = []

for i in range(len(df) - seq_length):
    data.append(df.Close.iloc[i:i + seq_length].values)

data = np.array(data)

train_size = int(len(data) * 0.8)

X_train = torch.from_numpy(data[:train_size, :-1]).type(torch.Tensor).unsqueeze(-1).to(device)
y_train = torch.from_numpy(data[:train_size, -1]).type(torch.Tensor).unsqueeze(-1).to(device)
X_test = torch.from_numpy(data[train_size:, :-1]).type(torch.Tensor).unsqueeze(-1).to(device)
y_test = torch.from_numpy(data[train_size:, -1]).type(torch.Tensor).unsqueeze(-1).to(device)

# Cell 9
class PredictionModel(nn.Module):

    def __init__(self, input_dim, hidden_dim, num_layers, output_dim):
        super(PredictionModel, self).__init__()

        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim, device=device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim, device=device)

        out, (hn, cn) = self.lstm(x, (h0.detach(), c0.detach()))
        out = self.fc(out[:, -1, :])

        return out

# Cell 10
model = PredictionModel(input_dim=1, hidden_dim=32, num_layers=2, output_dim=1).to(device)

# Cell 11
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.02)

# Cell 12
num_epochs = 200

for i in range(num_epochs):
    y_train_pred = model(X_train)

    loss = criterion(y_train_pred, y_train)

    if i % 25 == 0:
        print(i, loss.item())

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

# Cell 13
model.eval()

y_test_pred = model(X_test)

y_train_pred = scaler.inverse_transform(y_train_pred.detach().cpu().numpy())
y_test_pred = scaler.inverse_transform(y_test_pred.detach().cpu().numpy())
y_train = scaler.inverse_transform(y_train.detach().cpu().numpy())
y_test = scaler.inverse_transform(y_test.detach().cpu().numpy())

# Cell 14
train_rmse = root_mean_squared_error(y_train[:, 0], y_train_pred[:, 0])
test_rmse = root_mean_squared_error(y_test[:, 0], y_test_pred[:, 0])

# Cell 15
print(f"Train RMSE: {train_rmse}")

# Cell 16
print(f"Test RMSE: {test_rmse}")

# Cell 17
fig = plt.figure(figsize=(12, 10))

gs = fig.add_gridspec(4, 1, height_ratios=[3, 1, 1, 1])

ax1 = fig.add_subplot(gs[:3, 0])
ax1.plot(df.iloc[-len(y_test):].index, y_test, label='Actual Price', color='blue')
ax1.plot(df.iloc[-len(y_test):].index, y_test_pred, label='Predicted Price', color='green')
ax1.legend()
ax1.set_title(f"{ticker} Stock Price Prediction")
ax1.set_xlabel('Date')
ax1.set_ylabel('Price')

ax2 = fig.add_subplot(gs[3, 0])
ax2.axhline(test_rmse, color='blue', linestyle='--', label='Test RMSE')
ax2.plot(df.iloc[-len(y_test):].index, abs(y_test - y_test_pred), label='Absolute Error', color='red')
ax2.legend()
ax2.set_title('Prediction Error', pad=12)
ax2.set_xlabel('Date')
ax2.set_ylabel('Error')

fig.subplots_adjust(hspace=0.45)
plt.tight_layout(rect=[0, 0, 1, 0.97])
plt.show()
