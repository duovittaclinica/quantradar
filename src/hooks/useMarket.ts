import{useState,useCallback}from 'react';
import{useApi,useApiMutation}from './useApi';
export function useRadar(profile='MODERADO',type?:string,minScore=0){
  const params=new URLSearchParams({profile});
  if(type)params.set('type',type);
  if(minScore>0)params.set('minScore',String(minScore));
  return useApi(`/api/radar?${params}`);
}
export function useAsset(ticker:string|null){return useApi(ticker?`/api/quotes?ticker=${ticker}`:null);}
export function useNews(ticker?:string){return useApi(ticker?`/api/news?ticker=${ticker}`:'/api/news');}
export function useAlerts(){return useApi('/api/alerts');}
export function useCreateAlert(){return useApiMutation('/api/alerts');}
export function useSignals(){return useApi('/api/signals');}
export function useGenerateSignal(){return useApiMutation('/api/signals');}
export function useAiExplain(){return useApiMutation<any,any>('/api/ai/explain');}
export function useAiChat(ticker?:string){
  const[messages,setMessages]=useState<{role:string;content:string}[]>([]);
  const mutation=useApiMutation<any,any>('/api/ai/chat');
  const send=useCallback(async(content:string)=>{
    const newMsg={role:'user',content};
    setMessages(prev=>[...prev,newMsg]);
    const res=await mutation.mutate({ticker,messages:[...messages,newMsg]});
    if(res?.response)setMessages(prev=>[...prev,{role:'assistant',content:res.response}]);
    return res;
  },[messages,ticker,mutation]);
  return{messages,send,loading:mutation.loading};
}
export function useBacktest(){return useApiMutation<any,any>('/api/backtesting/run');}
export function useBacktestCompare(){return useApiMutation<any,any>('/api/backtesting/compare');}
export function useAdminStats(){return useApi('/api/admin/stats');}
export function useAdminConfig(){return useApi('/api/admin/config');}