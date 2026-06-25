import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
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

const RATE_KEY = ['exchange-rate'];
export const API_URL = process.env.EXPO_PUBLIC_COTIZAVE_API_URL || Constants?.expoConfig?.extra?.EXPO_PUBLIC_COTIZAVE_API_URL;
export const API_KEY = process.env.EXPO_PUBLIC_COTIZAVE_KEY || Constants?.expoConfig?.extra?.EXPO_PUBLIC_COTIZAVE_KEY;

console.log({ API_URL, API_KEY });

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
