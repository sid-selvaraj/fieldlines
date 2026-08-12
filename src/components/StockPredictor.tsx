import React, { useState, useEffect } from 'react';

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

  const SimpleLineChart = ({ values, title, yAxisLabel }: { values: number[]; title: string; yAxisLabel: string }) => {
    if (!values || values.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = { top: 40, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const rangeY = maxY - minY || 1;

    const points = values.map((v, i) => {
      const x = padding.left + (i / (values.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((v - minY) / rangeY) * chartHeight;
      return { x, y };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#1a1a1a' }}>{title}</h3>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: '#f5f3fb' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <line key={`h-${frac}`} x1={padding.left} y1={padding.top + frac * chartHeight} x2={padding.left + chartWidth} y2={padding.top + frac * chartHeight} stroke="#e0e0e0" strokeWidth="1" />
          ))}

          {/* Axes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#666" strokeWidth="2" />
          <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke="#666" strokeWidth="2" />

          {/* Y-axis labels */}
          {[0, 0.5, 1].map((frac) => {
            const value = minY + frac * rangeY;
            return (
              <text key={`label-${frac}`} x={padding.left - 10} y={padding.top + (1 - frac) * chartHeight} textAnchor="end" fontSize="12" fill="#666">
                {value.toFixed(0)}
              </text>
            );
          })}

          {/* Chart line */}
          <path d={pathD} fill="none" stroke="#7f77dd" strokeWidth="2.5" />

          {/* Title */}
          <text x={padding.left} y={20} fontSize="14" fontWeight="bold" fill="#1a1a1a">
            {title}
          </text>

          {/* Y-axis label */}
          <text x={10} y={height / 2} textAnchor="middle" fontSize="12" fill="#666" transform={`rotate(-90 10 ${height / 2})`}>
            {yAxisLabel}
          </text>
        </svg>
      </div>
    );
  };

  useEffect(() => {
    // Data is rendered directly via component, no need for external libraries
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

      {data && (
        <>
          <SimpleLineChart values={data.actual} title={`${ticker} Actual vs Predicted Price`} yAxisLabel="Price (USD)" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <SimpleLineChart values={data.predicted} title="Predicted Prices" yAxisLabel="Price (USD)" />
            </div>
          </div>

          <div className="metrics">
            <div className="metric">
              <span className="metric-label">Test RMSE</span>
              <span className="metric-value">${data.rmse.toFixed(2)}</span>
            </div>
          </div>

          <SimpleLineChart values={data.error} title="Prediction Error Over Time" yAxisLabel="Error (USD)" />
        </>
      )}

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
