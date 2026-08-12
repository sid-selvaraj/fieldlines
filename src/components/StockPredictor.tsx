import React, { useState, useEffect } from 'react';
import type { PlotlyHTMLElement } from 'react-plotly.js';

declare global {
  interface Window {
    Plotly: any;
  }
}

interface PredictionData {
  dates: string[];
  actual: number[];
  predicted: number[];
  rmse: number;
  error: number[];
}

export default function StockPredictor() {
  const [ticker, setTicker] = useState('AAPL');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PredictionData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const commonStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM',
    'JNJ', 'V', 'WMT', 'BAC', 'PG', 'MA', 'HD', 'DIS'
  ];

  useEffect(() => {
    fetchPrediction(ticker);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);

    if (value.length > 0) {
      const filtered = commonStocks.filter(stock =>
        stock.includes(value)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const selectStock = (symbol: string) => {
    setTicker(symbol);
    setInputValue(symbol);
    setSuggestions([]);
    fetchPrediction(symbol);
  };

  const fetchPrediction = async (symbol: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/predict-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: symbol }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch predictions for ${symbol}`);
      }

      const result = await response.json();
      setData(result);
      setTicker(symbol);
    } catch (err) {
      setError(`Could not fetch data for ${symbol}. Please try another ticker.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      selectStock(inputValue);
    }
  };

  useEffect(() => {
    if (!data || typeof window === 'undefined') return;

    // Wait for Plotly with more aggressive retry
    const tryRender = (attempts = 0) => {
      const Plotly = (window as any).Plotly;

      if (!Plotly) {
        if (attempts < 200) {
          setTimeout(() => tryRender(attempts + 1), 25);
        }
        return;
      }

      try {
        const priceDiv = document.getElementById('price-chart');
        const errorDiv = document.getElementById('error-chart');

        if (!priceDiv || !errorDiv) {
          console.error('Chart divs not found');
          return;
        }

        // Price chart data
        const priceData = [
          {
            x: data.dates,
            y: data.actual,
            name: 'Actual Price',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#5b4fa3', width: 2.5 },
          },
          {
            x: data.dates,
            y: data.predicted,
            name: 'Predicted Price',
            type: 'scatter',
            mode: 'lines',
            line: { color: '#7f77dd', width: 2.5 },
          },
        ];

        const priceLayout = {
          title: `${ticker} Stock Price Prediction`,
          xaxis: { title: 'Date' },
          yaxis: { title: 'Price (USD)' },
          hovermode: 'x unified',
          plot_bgcolor: '#f5f3fb',
          paper_bgcolor: '#fdfdfc',
          font: { family: 'Inter, sans-serif', color: '#1a1a1a' },
          margin: { l: 60, r: 40, t: 60, b: 40 },
        };

        Plotly.newPlot(priceDiv, priceData, priceLayout, { responsive: true });

        // Error chart data
        const errorData = [
          {
            x: data.dates,
            y: data.error,
            type: 'scatter',
            mode: 'lines',
            name: 'Absolute Error',
            fill: 'tozeroy',
            line: { color: '#9f77dd' },
            fillcolor: 'rgba(159, 119, 221, 0.2)',
          },
        ];

        const errorLayout = {
          title: 'Prediction Error Over Time',
          xaxis: { title: 'Date' },
          yaxis: { title: 'Error (USD)' },
          hovermode: 'x unified',
          plot_bgcolor: '#f5f3fb',
          paper_bgcolor: '#fdfdfc',
          font: { family: 'Inter, sans-serif', color: '#1a1a1a' },
          margin: { l: 60, r: 40, t: 60, b: 40 },
          showlegend: false,
        };

        Plotly.newPlot(errorDiv, errorData, errorLayout, { responsive: true });
      } catch (err) {
        console.error('Plotly error:', err);
      }
    };

    tryRender();
  }, [data, ticker]);

  return (
    <div className="stock-predictor">
      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Enter stock ticker (e.g., AAPL, GOOGL, TSLA)"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="ticker-input"
          />
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map(symbol => (
                <div
                  key={symbol}
                  className="suggestion-item"
                  onClick={() => selectStock(symbol)}
                >
                  {symbol}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => inputValue && selectStock(inputValue)}
          className="search-btn"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="current-ticker">
        Current: <span className="ticker-badge">{ticker}</span>
      </div>

      <div id="price-chart" className="chart-container"></div>

      {data && (
        <div className="metrics">
          <div className="metric">
            <span className="metric-label">Test RMSE</span>
            <span className="metric-value">${data.rmse.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div id="error-chart" className="chart-container"></div>

      <div className="info-box">
        <h3>About this model</h3>
        <p>
          This LSTM neural network is trained on historical stock price data to forecast future closing prices.
          The model uses a sequence length of 30 days and has been trained to minimize prediction error.
        </p>
        <p>
          <strong>Note:</strong> This is a demonstration model. Real trading decisions should never be based
          solely on automated predictions. Always conduct thorough research and consult with financial advisors.
        </p>
      </div>

      <style jsx>{`
        .stock-predictor {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .search-container {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 200px;
        }

        .ticker-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e8e8e4;
          border-radius: 8px;
          font-size: 14px;
          font-family: system-ui, sans-serif;
          background: #fdfdfc;
          color: #1a1a1a;
        }

        .ticker-input:focus {
          outline: none;
          border-color: #7f77dd;
          box-shadow: 0 0 0 3px rgba(127, 119, 221, 0.1);
        }

        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ede9ff;
          border: 1px solid #9f96d4;
          border-top: none;
          border-radius: 0 0 8px 8px;
          z-index: 10;
          max-height: 200px;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(127, 119, 221, 0.2);
        }

        .suggestion-item {
          padding: 12px 14px;
          cursor: pointer;
          border-bottom: 1px solid #d9d0f5;
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .suggestion-item:hover {
          background: #f0f0f0;
          color: #7f77dd;
          font-weight: 600;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .search-btn {
          padding: 10px 20px;
          background: #7f77dd;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .search-btn:hover:not(:disabled) {
          background: #6b63c4;
        }

        .search-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .current-ticker {
          margin-bottom: 16px;
          font-size: 13px;
          color: #666666;
        }

        .ticker-badge {
          background: #eeedfe;
          color: #7f77dd;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }

        .error-message {
          background: #fce5e5;
          border: 1px solid #f5a5a5;
          color: #c5192d;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .chart-container {
          width: 100%;
          height: 400px;
          margin-bottom: 32px;
          border: 1px solid #e8e8e4;
          border-radius: 8px;
          background: #fdfdfc;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric {
          background: #f7f7f4;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e8e8e4;
        }

        .metric-label {
          display: block;
          font-size: 12px;
          color: #aaaaaa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .metric-value {
          display: block;
          font-size: 24px;
          font-weight: 600;
          color: #7f77dd;
        }

        .info-box {
          background: #f7f7f4;
          border-left: 3px solid #7f77dd;
          padding: 16px;
          border-radius: 8px;
          margin-top: 32px;
        }

        .info-box h3 {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 16px;
          margin-bottom: 12px;
          color: #1a1a1a;
        }

        .info-box p {
          font-size: 13px;
          color: #666666;
          line-height: 1.6;
          margin-bottom: 10px;
        }

        .info-box p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 600px) {
          .search-container {
            flex-direction: column;
          }

          .search-btn {
            width: 100%;
          }

          .chart-container {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
