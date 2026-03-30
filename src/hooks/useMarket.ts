import{useState,useCallback}from 'react';
import{useApi,useApiMutation}from './useApi';
export function useRadar(profile='MODERADO',type,minScore=0){
  const params=new URLSearchParams({profile});
  if(type)params.set('type',type);
  if(minScore>0)params.set('minScore',String(minScore));
  return useApi('/api/radar?'+params);
}
export function useAsset(ticker){return useApi(ticker?'/api/quotes?ticker='+ticker:null);}
export function useNews(ticker){return useApi(ticker?'/api/news?ticker='+ticker:'/api/news');}
export function useAlerts(){return useApi('/api/alerts');}
export function useCreateAlert(){return useApiMutation('/api/alerts');}
export function useSignals(){return useApi('/api/signals');}
export function useGenerateSignal(){return useApiMutation('/api/signals');}
export function useBacktest(){return useApiMutation('/api/backtesting/run');}
export function useBacktestCompare(){return useApiMutation('/api/backtesting/compare');}
export function useAdminStats(){return useApi('/api/admin/stats');}
export function useAdminConfig(){return useApi('/api/admin/config');}
export function useWatchlist(){return useApi('/api/watchlist');}
export function useCreateWatchlist(){return useApiMutation('/api/watchlist','POST');}
export function useAddToWatchlist(){return useApiMutation('/api/watchlist/add','POST');}
export function useRemoveFromWatchlist(){return useApiMutation('/api/watchlist/remove','DELETE');}
export function useAiExplain(){return useApiMutation('/api/ai/explain');}
export function useAiChat(ticker){
  const[messages,setMessages]=useState([]);
  const mutation=useApiMutation('/api/ai/chat');
  const send=useCallback(async(content)=>{
    const newMsg={role:'user',content};
    setMessages(prev=>[...prev,newMsg]);
    const res=await mutation.mutate({ticker,messages:[...messages,newMsg]});
    if(res&&res.response)setMessages(prev=>[...prev,{role:'assistant',content:res.response}]);
    return res;
  },[messages,ticker]);
  return{messages,send,loading:mutation.loading};
}