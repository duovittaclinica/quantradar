import React,{useState}from 'react';
import{useWatchlist,useAddToWatchlist,useCreateWatchlist,useGenerateSignal}from '../hooks/useMarket';
import{useSession}from 'next-auth/react';
import Link from 'next/link';
export default function WatchlistPage(){
  const{data:session}=useSession();
  const{data:watchlists,loading,error,refetch}=useWatchlist();
  const createWL=useCreateWatchlist();
  const generateSignal=useGenerateSignal();
  const[newTicker,setNewTicker]=useState('');
  const[adding,setAdding]=useState(false);
  const[activeWL,setActiveWL]=useState<string|null>(null);
  const wls=(watchlists as any[])||[];
  const current=wls.find(w=>w.id===activeWL)??wls[0];
  const addWLItem=useAddToWatchlist(current?.id??'');
  const handleAdd=async()=>{
    if(!newTicker.trim()||!current)return;
    setAdding(true);
    try{
      await generateSignal.mutate({ticker:newTicker.toUpperCase()});
      await addWLItem.mutate({ticker:newTicker.toUpperCase()});
      setNewTicker('');refetch();
    }catch(e){console.error(e);}finally{setAdding(false);}
  };
  if(loading)return<div style={{padding:24,color:'var(--text-muted)'}}>Carregando...</div>;
  if(error)return<div style={{padding:24,color:'var(--red)'}}>Erro: {error}</div>;
  return(<div style={{padding:24}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
      <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)'}}>Watchlist</h1>
      <button onClick={()=>createWL.mutate({name:'Nova Watchlist'}).then(()=>refetch())} style={{padding:'8px 16px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Nova</button>
    </div>
    {wls.length>1&&<div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>{wls.map((w:any)=><button key={w.id} onClick={()=>setActiveWL(w.id)} style={{padding:'6px 14px',borderRadius:20,background:current?.id===w.id?'var(--accent)':'var(--surface)',color:current?.id===w.id?'var(--bg)':'var(--text-muted)',border:`1px solid ${current?.id===w.id?'var(--accent)':'var(--border)'}`,fontSize:12,fontWeight:600,cursor:'pointer'}}>{w.name} ({w.items?.length??0})</button>)}</div>}
    {current&&<div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        <input value={newTicker} onChange={e=>setNewTicker(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="Adicionar ativo (ex: PETR4)" style={{flex:1,padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none'}}/>
        <button onClick={handleAdd} disabled={adding||!newTicker.trim()} style={{padding:'10px 20px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',opacity:adding?0.6:1}}>{adding?'...':'+ Adicionar'}</button>
      </div>
      {current.items?.length===0?<div style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)',fontSize:13}}>Nenhum ativo adicionado ainda</div>:<div style={{display:'flex',flexDirection:'column',gap:10}}>{current.items?.map((item:any)=><Link key={item.id} href={`/asset/${item.asset.ticker}`} style={{display:'block'}}><div style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px',background:'var(--surface)',borderRadius:10,border:'1px solid var(--border)',transition:'border-color .15s'}} onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--accent)44')} onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
        <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:'var(--text)'}}>{item.asset.ticker}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{item.asset.name}</div></div>
        <div style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(item.addedAt).toLocaleDateString('pt-BR')}</div>
      </div></Link>)}</div>}
    </div>}
  </div>);}
