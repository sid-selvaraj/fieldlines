import type { APIRoute } from 'astro';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid ticker symbol' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const predictions = await runLSTMPrediction(ticker.toUpperCase());
    return new Response(JSON.stringify(predictions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate predictions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function runLSTMPrediction(ticker: string) {
  return new Promise((resolve, reject) => {
    const pythonScript = join(tmpdir(), `predict_${Date.now()}.py`);

    const script = `
import numpy as np
import pandas as pd
import yfinance as yf
import json
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import root_mean_squared_error

# Set device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

try:
    # Download data
    df = yf.download('${ticker}', '2020-01-01', progress=False)

    if len(df) < 60:
        raise ValueError('Insufficient data')

    # Normalize
    scaler = StandardScaler()
    df['Close'] = scaler.fit_transform(df[['Close']])

    # Create sequences
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

    # Model
    class PredictionModel(nn.Module):
        def __init__(self, input_dim, hidden_dim, num_layers, output_dim):
            super().__init__()
            self.hidden_dim = hidden_dim
            self.num_layers = num_layers
            self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True)
            self.fc = nn.Linear(hidden_dim, output_dim)

        def forward(self, x):
            h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim, device=device)
            c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim, device=device)
            out, _ = self.lstm(x, (h0.detach(), c0.detach()))
            out = self.fc(out[:, -1, :])
            return out

    model = PredictionModel(1, 32, 2, 1).to(device)
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.02)

    # Train
    for i in range(100):
        y_train_pred = model(X_train)
        loss = criterion(y_train_pred, y_train)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    # Evaluate
    model.eval()
    y_test_pred = model(X_test)

    y_train_pred = scaler.inverse_transform(y_train_pred.detach().cpu().numpy())
    y_test_pred = scaler.inverse_transform(y_test_pred.detach().cpu().numpy())
    y_train = scaler.inverse_transform(y_train.detach().cpu().numpy())
    y_test = scaler.inverse_transform(y_test.detach().cpu().numpy())

    rmse = root_mean_squared_error(y_test[:, 0], y_test_pred[:, 0])
    error = np.abs(y_test[:, 0] - y_test_pred[:, 0])

    # Prepare response
    test_dates = df.iloc[-len(y_test):].index.strftime('%Y-%m-%d').tolist()

    result = {
        'dates': test_dates,
        'actual': y_test[:, 0].tolist(),
        'predicted': y_test_pred[:, 0].tolist(),
        'rmse': float(rmse),
        'error': error.tolist()
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({{'error': str(e)}}))
`;

    writeFileSync(pythonScript, script);

    const python = spawn('python3', [pythonScript]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      try {
        unlinkSync(pythonScript);
      } catch (e) {
        // ignore cleanup errors
      }

      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(new Error(`Failed to parse prediction results: ${e}`));
      }
    });

    python.on('error', (err) => {
      try {
        unlinkSync(pythonScript);
      } catch (e) {
        // ignore cleanup errors
      }
      reject(err);
    });
  });
}
