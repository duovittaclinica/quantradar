import{useState,useCallback}from 'react';
import{useApi,useApiMutation}from './useApi';
import type{RadarEntry,EnrichedAsset,NewsItem,ScoringResult,InvestorProfile}from '../types';
export function useRadar(profile:InvestorProfile|string='MODERADO',type?:string,minScore?:number){
  const p=new URLSearchParams({profile});
  if(type)p.set('type',type);
  if(minScore!==undefined&&minScore>0)p.set('minScore',String(minScore));
  return useApi<RadarEntry[]>(`/api/radar?${p}`);
}
export function useAsset(ticker:string|null){return useApi<EnrichedAsset>(ticker?`/api/quotes?ticker=${ticker}`:null);}
export function useBatchAssets(tickers:string[]){const url=tickers.length>`0`?`/api/quotes?tickers=${tickers.join(',')}`:null;return useApi<EnrichedAsset[]>(url);}
export function useNews(ticker?:string,sentiment?:string){const p=new URLSearchParams();if(ticker)p.set('ticker',ticker);if(sentiment)p.set('sentiment',sentiment);return useApi<NewsItem[]>(`/api/news?${p}`);}
export function useSignals(limit=20){return useApi<any[]>(`/api/signals?limit=${limit}`);}
export function useGenerateSignal(){return useApiMutation<{ticker:string;profile?:string},{signal:any;result:ScoringResult}>('/api/signals');}
export function useWatchlist(){return useApi<any[]>('/api/watchlist');}
export function useAddToWatchlist(watchlistId:string){return useApiMutation<{ticker:string;notes?:string;targetPrice?:number},any>(`/api/watchlist/${watchlistId}/add`);}
export function useCreateWatchlist(){return useApiMutation<{name:string},any>('/api/watchlist');}
export function useAlerts(){return useApi<{alerts:any[];unread:number}>('/api/alerts');}
export function useCreateAlert(){return useApiMutation<any,any>('/api/alerts');}
export function useAiExplain(){return useApiMutation<{ticker:string;profile?:string;question?:string},{ticker:string;analysis:string;score:number;tag:string;breakdown:any;usageRemaining:number}>('/api/ai/explain');}
export interface ChatMessage{role:'user'|'assistant';content:string;}
export function useAiChat(ticker?:string){
  const[messages,setMessages]=useState<ChatMessage[]>([]);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const send=useCallback(async(content:string)=>{
    const userMsg:ChatMessage={role:'user',content};
    const next=[...messages,userMsg];setMessages(next);setLoading(true);setError(null);
    try{const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticker,message:content,history:next.slice(-6)})});const json=await res.json();if(!json.success)throw new Error(json.error?.message);setMessages(prev=>[...prev,{role:'assistant',content:json.data.reply}]);}
    catch(e){setError((e as Error).message);}finally{setLoading(false);}
  },[messages,ticker]);
  const reset=useCallback(()=>{setMessages([]);setError(null);},[]);
  return{messages,loading,error,send,reset};
}
export function useBacktest(){return useApiMutation<{ticker:string;minScore?:number;targetPct?:number;stopPct?:number;maxHoldingDays?:number;profile?:string},any>('/api/backtesting/run');}
export function useBacktestCompare(){return useApiMutation<{tickers:string[];profile?:string},any>('/api/backtesting/compare');}
export function useAdminStats(){return useApi<any>('/api/admin/stats');}
export function useAdminConfig(){return useApi<any[]>('/api/admin/config');}