import { useState, useEffect, useCallback, useRef } from 'react';
interface FetchState<T> { data: T|null; loading: boolean; error: string|null; }
export function useApi<T>(url: string|null, options?: RequestInit) {
  const [state, setState] = useState<FetchState<T>>({data:null,loading:!!url,error:null});
  const abortRef = useRef<AbortController|null>(null);
  const fetch_ = useCallback(async () => {
    if (!url) { setState({data:null,loading:false,error:null}); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    setState(p => ({...p,loading:true,error:null}));
    try {
      const res = await fetch(url, {...options,signal:ctrl.signal});
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      setState({data:json.data??json,loading:false,error:null});
    } catch(err) {
      if ((err as Error).name === 'AbortError') return;
      setState({data:null,loading:false,error:(err as Error).message});
    }
  }, [url]);
  useEffect(() => { fetch_(); return () => abortRef.current?.abort(); }, [fetch_]);
  return {...state, refetch: fetch_};
}
export function useApiMutation<TInput,TOutput>(url: string, method = 'POST') {
  const [state, setState] = useState<FetchState<TOutput>>({data:null,loading:false,error:null});
  const mutate = useCallback(async (body: TInput): Promise<TOutput|null> => {
    setState({data:null,loading:true,error:null});
    try {
      const res = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
      const out = json.data??json; setState({data:out,loading:false,error:null}); return out;
    } catch(err) { setState({data:null,loading:false,error:(err as Error).message}); return null; }
  }, [url,method]);
  return {...state, mutate};
}
