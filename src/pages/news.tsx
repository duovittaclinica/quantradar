import React,{useState}from 'react';
import{useNews}from '../hooks/useMarket';
import Link from 'next/link';
const SENTIMENTS=[{v:'',l:'Todos'},{v:'positivo',l:'Positivo'},{v:'neutro',l:'Neutro'},{v:'negativo',l:'Negativo'}];
const SBADGE:Record<string,{bg:string;color:string;label:string}>={positivo:{bg:'var(--green-dim)',color:'var(--green)',label:'↑'},neutro:{bg:'var(--yellow-dim)',color:'var(--yellow)',label:'◦'},negativo:{bg:'var(--red-dim)',color:'var(--red)',label:'↓'}};
export default function NewsPage(){
  const[sent,setSent]=useState('');
  const[search,setSearch]=useState('');
  const{data:articles,loading,error}=useNews(undefined,sent||undefined);
  const filtered=(articles??[]).filter(a=>!search||a.title.toLowerCase().includes(search.toLowerCase()));
  return(<div style={{padding:24}}>
    <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)',marginBottom:20}}>📰 Notícias do Mercado</h1>
    <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar notícias..." style={{flex:1,minWidth:200,padding:'8px 14px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none'}}/>
      <div style={{display:'flex',gap:6}}>{SENTIMENTS.map(s=><button key={s.v} onClick={()=>setSent(s.v)} style={{padding:'8px 14px',borderRadius:8,background:sent===s.v?'var(--accent)':'var(--surface)',color:sent===s.v?'var(--bg)':'var(--text-muted)',border:`1px solid ${sent===s.v?'var(--accent)':'var(--border)'}`,fontSize:12,fontWeight:600,cursor:'pointer'}}>{s.l}</button>)}</div>
    </div>
    {loading&&<div style={{display:'flex',flexDirection:'column',gap:10}}>{[1,2,3,4,5].map(i=><div key={i} style={{height:96,background:'var(--card)',borderRadius:12,border:'1px solid var(--border)',animation:'pulse 1.5s infinite'}}/>)}</div>}
    {error&&<div style={{color:'var(--red)',fontSize:13}}>Erro ao carregar notícias</div>}
    {!loading&&!error&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
      {filtered.length===0?<div style={{textAlign:'center',padding:'40px 0',color:'var(--text-muted)'}}>Nenhuma notícia encontrada</div>:filtered.map((a:any,i:number)=>{
        const sb=SBADGE[a.sentiment as string]??SBADGE['neutro'];
        return(<div key={i} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',transition:'border-color .15s'}} onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--accent)44')} onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{flexShrink:0,width:28,height:28,borderRadius:6,background:sb.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:sb.color,fontWeight:900}}>{sb.label}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:'var(--text)',lineHeight:1.4,marginBottom:6}}>{a.title}</div>
              {a.description&&<div style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.5,marginBottom:8}}>{a.description?.slice(0,160)}...</div>}
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <span style={{fontSize:11,color:'var(--text-muted)'}}>{a.source}</span>
                <span style={{fontSize:11,color:'var(--text-dim)'}}>·</span>
                <span style={{fontSize:11,color:'var(--text-muted)'}}>{new Date(a.publishedAt).toLocaleDateString('pt-BR')}</span>
                {a.relatedTickers?.map((t:string)=><Link key={t} href={`/asset/${t}`}><span style={{fontSize:10,padding:'2px 8px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:99,color:'var(--accent)',fontWeight:700}}>{t}</span></Link>)}
              </div>
            </div>
            {a.url&&<a href={a.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:'var(--accent)',flexShrink:0,padding:'4px 10px',border:'1px solid var(--accent)33',borderRadius:6}}>Ler →</a>}
          </div>
        </div>);
      })}
    </div>}
  </div>);}
