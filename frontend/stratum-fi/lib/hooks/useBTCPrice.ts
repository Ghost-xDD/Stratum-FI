/**
 * Hook to fetch BTC price from CoinGecko API
 * Free tier: 50 calls/minute, no API key needed
 */

import { useState, useEffect } from 'react';

const COINGECKO_API =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

export function useBTCPrice() {
  const [price, setPrice] = useState<number>(59000); // Default fallback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const response = await fetch(COINGECKO_API);

        if (!response.ok) {
          throw new Error('Failed to fetch BTC price');
        }

        const data = await response.json();
        const btcPrice = data?.bitcoin?.usd;

        if (btcPrice && typeof btcPrice === 'number') {
          setPrice(btcPrice);
        }
      } catch (err) {
        console.error('Error fetching BTC price:', err);
        setError(err as Error);
        // Keep using fallback price
      } finally {
        setLoading(false);
      }
    }

    fetchPrice();

    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    return () => clearInterval(interval);
  }, []);

  return { price, loading, error };
}
