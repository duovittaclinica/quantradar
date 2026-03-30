interface FetchWithRetryOptions extends RequestInit {
  timeout?: number; retries?: number; retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}
export async function fetchWithRetry<T = unknown>(url: string, options: FetchWithRetryOptions = {}): Promise<T> {
  const { timeout = 8000, retries = 3, retryDelay = 1000, onRetry, ...fetchOptions } = options;
  let lastError: Error = new Error('Unknown error');
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      return await res.json() as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries) { onRetry?.(attempt, lastError); await new Promise(r => setTimeout(r, retryDelay * attempt)); }
    }
  }
  throw lastError;
}
