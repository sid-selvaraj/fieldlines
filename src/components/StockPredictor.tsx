import React, { useState, useEffect } from 'react';

interface PredictionData {
  dates: string[];
  actual: number[];
  predicted: number[];
  rmse: number;
  error: number[];
}

type TimeRange = 'all' | '10y' | '5y' | '1y' | '1m';

export default function StockPredictor() {
  const [ticker, setTicker] = useState('AAPL');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PredictionData | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [cachedData, setCachedData] = useState<{ [key: string]: PredictionData }>({});

  const commonStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM',
    'JNJ', 'V', 'WMT', 'BAC', 'PG', 'MA', 'HD', 'DIS'
  ];

  useEffect(() => {
    fetchPrediction('AAPL');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);

    if (value.length > 0) {
      const filtered = commonStocks.filter(stock => stock.includes(value));
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
    // Check cache first
    if (cachedData[symbol]) {
      setData(cachedData[symbol]);
      setTicker(symbol);
      return;
    }

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
      setCachedData(prev => ({ ...prev, [symbol]: result }));
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

  const getFilteredData = () => {
    if (!data) return null;

    const today = new Date();
    let startIndex = 0;

    switch (timeRange) {
      case '1m':
        startIndex = Math.max(0, data.dates.length - 30);
        break;
      case '1y':
        startIndex = Math.max(0, data.dates.length - 252); // Trading days
        break;
      case '5y':
        startIndex = Math.max(0, data.dates.length - 1260);
        break;
      case '10y':
        startIndex = Math.max(0, data.dates.length - 2520);
        break;
      default:
        startIndex = 0;
    }

    return {
      dates: data.dates.slice(startIndex),
      actual: data.actual.slice(startIndex),
      predicted: data.predicted.slice(startIndex),
      error: data.error.slice(startIndex),
    };
  };

  const Chart = ({ actualValues, predictedValues, dates, title, yLabel }:
    { actualValues: number[]; predictedValues?: number[]; dates: string[]; title: string; yLabel: string }) => {

    if (!actualValues || actualValues.length === 0) return null;

    const width = 1000;
    const height = 400;
    const padding = { top: 30, right: 30, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const allValues = predictedValues ? [...actualValues, ...predictedValues] : actualValues;
    const minY = Math.min(...allValues);
    const maxY = Math.max(...allValues);
    const rangeY = maxY - minY || 1;

    const getPath = (values: number[]) => {
      return values.map((v, i) => {
        const x = padding.left + (i / (values.length - 1 || 1)) * chartWidth;
        const y = padding.top + chartHeight - ((v - minY) / rangeY) * chartHeight;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    // Format dates for x-axis
    const step = Math.ceil(dates.length / 6);
    const xLabels = dates.map((d, i) => i % step === 0 ? d : null).filter(Boolean);

    return (
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>{title}</h3>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <line
              key={`grid-${frac}`}
              x1={padding.left}
              y1={padding.top + frac * chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + frac * chartHeight}
              stroke="#333333"
              strokeWidth="1"
            />
          ))}

          {/* Axes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke="#666666" strokeWidth="2" />
          <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke="#666666" strokeWidth="2" />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const value = minY + frac * rangeY;
            return (
              <text key={`ylabel-${frac}`} x={padding.left - 15} y={padding.top + (1 - frac) * chartHeight + 5} textAnchor="end" fontSize="12" fill="#ffffff">
                ${value.toFixed(0)}
              </text>
            );
          })}

          {/* X-axis labels */}
          {dates.map((date, i) => {
            if (i % Math.ceil(dates.length / 6) === 0 || i === dates.length - 1) {
              const x = padding.left + (i / (dates.length - 1 || 1)) * chartWidth;
              return (
                <text key={`xlabel-${i}`} x={x} y={height - 10} textAnchor="middle" fontSize="11" fill="#ffffff">
                  {date}
                </text>
              );
            }
            return null;
          })}

          {/* Y-axis label */}
          <text x={20} y={height / 2} textAnchor="middle" fontSize="13" fill="#ffffff" transform={`rotate(-90 20 ${height / 2})`}>
            {yLabel}
          </text>

          {/* Actual price line */}
          <path d={getPath(actualValues)} fill="none" stroke="#7f77dd" strokeWidth="2.5" opacity="0.8" />

          {/* Predicted price line */}
          {predictedValues && (
            <path d={getPath(predictedValues)} fill="none" stroke="#5b4fa3" strokeWidth="2.5" opacity="0.8" strokeDasharray="5,5" />
          )}

          {/* Legend */}
          <circle cx={padding.left + 20} cy={20} r="4" fill="#7f77dd" />
          <text x={padding.left + 35} y={24} fontSize="12" fill="#ffffff">Actual</text>

          {predictedValues && (
            <>
              <circle cx={padding.left + 150} cy={20} r="4" fill="#5b4fa3" />
              <text x={padding.left + 165} y={24} fontSize="12" fill="#ffffff">Predicted</text>
            </>
          )}
        </svg>
      </div>
    );
  };

  const filteredData = getFilteredData();

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
          <div className="time-range-selector">
            <label>Time Range:</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as TimeRange)} className="time-select">
              <option value="all">All Time</option>
              <option value="10y">Last 10 Years</option>
              <option value="5y">Last 5 Years</option>
              <option value="1y">Last 1 Year</option>
              <option value="1m">Last Month</option>
            </select>
          </div>

          {filteredData && (
            <>
              <Chart
                actualValues={filteredData.actual}
                predictedValues={filteredData.predicted}
                dates={filteredData.dates}
                title={`${ticker} Stock Price Prediction`}
                yLabel="Price (USD)"
              />

              <div className="metrics">
                <div className="metric">
                  <span className="metric-label">Test RMSE</span>
                  <span className="metric-value">${data.rmse.toFixed(2)}</span>
                  <span className="metric-info">Root Mean Squared Error - measures average prediction accuracy</span>
                </div>
              </div>

              <Chart
                actualValues={filteredData.error}
                dates={filteredData.dates}
                title="Prediction Error Over Time"
                yLabel="Error (USD)"
              />
            </>
          )}
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
          max-width: 1000px;
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

        .time-range-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .time-select {
          padding: 8px 12px;
          border: 1px solid #e8e8e4;
          border-radius: 6px;
          background: #fdfdfc;
          color: #1a1a1a;
          font-size: 13px;
          cursor: pointer;
        }

        .time-select:focus {
          outline: none;
          border-color: #7f77dd;
          box-shadow: 0 0 0 3px rgba(127, 119, 221, 0.1);
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin: 32px 0;
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
          margin-bottom: 8px;
        }

        .metric-info {
          display: block;
          font-size: 12px;
          color: #666666;
          line-height: 1.4;
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

          svg {
            height: 300px !important;
          }
        }
      `}</style>
    </div>
  );
}
