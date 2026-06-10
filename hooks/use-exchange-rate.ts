import { useQuery } from '@tanstack/react-query';

interface Rate {
  market: string;
  mid: number;
  updated_at?: string;
}

interface ExchangeRateResponse {
  country: string;
  currency: string;
  base: string;
  rates: Rate[];
  fetched_at: string;
}

const API_URL = process.env.EXPO_PUBLIC_COTIZAVE_API_URL!;
const API_KEY = process.env.EXPO_PUBLIC_COTIZAVE_KEY!;
const RATE_KEY = ['exchange-rate'];

async function fetchExchangeRate(): Promise<number> {
  const res = await fetch(API_URL, {
    headers: {
      'X-API-Key': API_KEY,
      Accept: 'application/json',
    },
  });
  const data: ExchangeRateResponse = await res.json();
  const reference = data.rates.find((r) => r.market === 'reference');
  return reference?.mid ?? 0;
}

export function useExchangeRate() {
  return useQuery({
    queryKey: RATE_KEY,
    queryFn: fetchExchangeRate,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });
}
