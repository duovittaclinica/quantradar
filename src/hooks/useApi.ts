import{useState,useEffect,useCallback}from 'react';
export function useApi<T>(url:string|null,options?:RequestInit){
  const[data,setData]=useState<T|null>(null);
  const[loading,setLoading]=useState(!!url);
  const[error,setError]=useState<string|null>(null);
  const fetchData=useCallback(async()=>{
    if(!url){setLoading(false);return;}
    setLoading(true);setError(null);
    try{const r=await fetch(url,options);if(!r.ok)throw new Error(await r.text());setData(await r.json());}
    catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  },[url]);
  useEffect(()=>{fetchData();},[fetchData]);
  return{data,loading,error,refetch:fetchData};
}
export function useApiMutation<TBody=unknown,TRes=unknown>(url:string,method='POST'){
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const[data,setData]=useState<TRes|null>(null);
  const mutate=async(body:TBody):Promise<TRes|null>=>{
    setLoading(true);setError(null);
    try{const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if(!r.ok)throw new Error(await r.text());const d=await r.json();setData(d);return d;}
    catch(e:any){setError(e.message);return null;}
    finally{setLoading(false);}
  };
  return{mutate,loading,error,data};
}