import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ticker } = await request.json();

    if (!ticker || typeof ticker !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid ticker symbol' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate mock data for demonstration
    const predictions = generateMockPredictions(ticker.toUpperCase());

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

function generateMockPredictions(ticker: string) {
  // Generate dates for the past 100 days
  const dates: string[] = [];
  const today = new Date();

  for (let i = 100; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // Generate realistic price data based on ticker
  const basePrices: { [key: string]: number } = {
    'AAPL': 230,
    'GOOGL': 140,
    'MSFT': 420,
    'AMZN': 180,
    'TSLA': 240,
    'META': 520,
    'NVDA': 875,
    'JPM': 195,
    'JNJ': 158,
    'V': 285,
  };

  const basePrice = basePrices[ticker] || 150;

  const actual: number[] = [];
  const predicted: number[] = [];

  // Generate price movements
  let price = basePrice;
  for (let i = 0; i < dates.length; i++) {
    const volatility = (Math.random() - 0.5) * 2 * basePrice * 0.02;
    price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, price + volatility));
    actual.push(parseFloat(price.toFixed(2)));

    // Add some prediction error
    const predictionError = (Math.random() - 0.5) * basePrice * 0.05;
    predicted.push(parseFloat((price + predictionError).toFixed(2)));
  }

  // Calculate RMSE
  let sumSquaredError = 0;
  for (let i = 0; i < actual.length; i++) {
    sumSquaredError += Math.pow(actual[i] - predicted[i], 2);
  }
  const rmse = Math.sqrt(sumSquaredError / actual.length);

  // Calculate errors
  const error = actual.map((val, idx) => Math.abs(val - predicted[idx]));

  return {
    dates,
    actual,
    predicted,
    rmse: parseFloat(rmse.toFixed(2)),
    error,
  };
}
