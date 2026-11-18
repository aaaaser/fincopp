import type { LedgerSummaryData, SystemHealthData } from '../types/system';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error?.message ?? `Permintaan gagal (${response.status}).`);
  }
  return payload.data;
}

export function fetchSystemHealth(): Promise<SystemHealthData> {
  return apiRequest<SystemHealthData>('/api/health');
}

export function fetchLedgerSummary(): Promise<LedgerSummaryData> {
  return apiRequest<LedgerSummaryData>('/api/ledger/summary');
}
