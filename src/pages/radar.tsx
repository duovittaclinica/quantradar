/**
 * Radar page — /radar
 */
import React,{useState,useMemo}from 'react';
import{AreaChart,Area,ResponsiveContainer}from 'recharts';
import{useRadar}from '../hooks/useMarket';
import Link from 'next/link';
import type{RadarEntry}from '../types';
const PROFILES=[{v:'MODERADO',l:'Moderado'},{v:'CONSERVADOR',l:'Conservador'},{v:'AGRESSIVO',l:'Agressivo'},{v:'DIVIDENDOS',l:'Dividendos'},{v:'VALORIZACAO',l:'Valorização'}];
const TYPES=['TODOS','ACAO','FII','ETF','CRIPTO','BDR'];
const TC:Record<string,{bg:string;color:string;label:string}>={COMPRA_FORTE:{bg:'var(--green-dim)',color:'var(--green)',label:'🟢 COMPRA FORTE'},COMPRA_MODERADA:{bg:'rgba(0,212,255,.1)',color:'var(--accent)',label:'🔵 COMPRA MOD.'},AGUARDAR:{bg:'var(--yellow-dim)',color:'var(--yellow)',label:'🟡 AGUARDAR'},ALTO_RISCO:{bg:'var(--red-dim)',color:'var(--red)',label:'🔴 ALTO RISCO'},VENDA:{bg:'rgba(255,61,87,.2)',color:'var(--red)',label:'🔻 VENDA'}};
export default function RadarPage(){
  const[profile,setProfile]=useState('MODERADO');
  const[typeFilter,setTypeFilter]=useState('TODOS');
  const[sortBy,setSortBy]=useState('score');
  const[search,setSearch]=useState('');
  const{data,loading,error,refetch}=useRadar(profile);
  const filtered=useMemo(()=>{
    if(!data)return[];
    const list=data as RadarEntry[];
    return list
      .filter(e=>typeFilter==='TODOS'||e.type===typeFilter)
      .filter(e=>!search||e.ticker.includes(search.toUpperCase())||e.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a,b)=>sortBy==='volume'?b.volume-a.volume:sortBy==='change'?b.changePercent-a.changePercent:b.score-a.score)
      .map((e,i)=>({...e,rank:i+1}));
  },[data,typeFilter,search,sortBy]);
  return(
    <div style={{padding:24}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)'}}>⚡ Radar de Oportunidades</h1>
        <button onClick={()=>refetch()} style={{padding:'8px 16px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>↻ Atualizar</button>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Filtrar..." style={{padding:'8px 12px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',minWidth:160}}/>
        <select value={profile} onChange={e=>setProfile(e.target.value)} style={{padding:'8px 12px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',cursor:'pointer'}}>
          {PROFILES.map(p=><option key={p.v} value={p.v}>{p.l}</option>)}
        </select>
        <div style={{display:'flex',gap:6}}>{TYPES.map(t=><button key={t} onClick={()=>setTypeFilter(t)} style={{padding:'6px 12px',borderRadius:8,background:typeFilter===t?'var(--accent)':'var(--surface)',color:typeFilter===t?'var(--bg)':'var(--text-muted)',border:`1px solid ${typeFilter===t?'var(--accent)':'var(--border)'}`,fontSize:11,fontWeight:600,cursor:'pointer'}}>{t}</button>)}</div>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{padding:'8px 12px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',cursor:'pointer'}}>
          <option value="score">Score</option><option value="volume">Volume</option><option value="change">Variação</option>
        </select>
      </div>
      {loading&&<div style={{color:'var(--text-muted)',fontSize:13,padding:40,textAlign:'center'}}>Carregando radar...</div>}
      {error&&<div style={{color:'var(--red)',fontSize:13}}>{error}</div>}
      {!loading&&!error&&<>
        <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:12}}>{filtered.length} ativos</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(item=>{
            const tc=TC[item.tag]??TC.AGUARDAR;
            return(
              <Link key={item.ticker} href={'/asset/'+item.ticker} style={{display:'block',textDecoration:'none'}}>
                <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 20px',cursor:'pointer',transition:'border-color .15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--accent)44')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                  <div style={{display:'flex',alignItems:'center',gap:16}}>
                    <div style={{width:52,height:52,borderRadius:'50%',border:'3px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:item.score>=75?'var(--green)':item.score>=55?'var(--yellow)':'var(--red)',flexShrink:0}}>{item.score}</div>
                    <div style={{minWidth:160}}>
                      <div style={{fontWeight:800,fontSize:15,color:'var(--text)'}}>{item.ticker}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{item.name}</div>
                      {item.sector&&<div style={{fontSize:11,color:'var(--text-dim)'}}>{item.sector}</div>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{padding:'3px 10px',borderRadius:6,background:tc.bg,color:tc.color,fontSize:11,fontWeight:700,display:'inline-block'}}>{tc.label}</div>
                    </div>
                    <div style={{textAlign:'right',minWidth:120}}>
                      <div style={{fontSize:17,fontWeight:800,color:'var(--text)'}}>{item.type==='CRIPTO'?'$':'R$'} {item.price.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
                      <div style={{fontSize:12,fontWeight:700,color:item.changePercent>=0?'var(--green)':'var(--red)'}}>{item.changePercent>=0?'+':''}{item.changePercent.toFixed(2)}%</div>
                    </div>
                    <div style={{display:'flex',gap:12,minWidth:180}}>
                      <div style={{textAlign:'center'}}><div style={{fontSize:10,color:'var(--text-muted)'}}>RSI</div><div style={{fontSize:13,fontWeight:700,color:item.technicals.rsi14<35?'var(--green)':item.technicals.rsi14>70?'var(--red)':'var(--text)',fontFamily:'var(--mono)'}}>{item.technicals.rsi14.toFixed(0)}</div></div>
                      {item.dividendYield&&<div style={{textAlign:'center'}}><div style={{fontSize:10,color:'var(--text-muted)'}}>DY</div><div style={{fontSize:13,fontWeight:700,color:'var(--accent)',fontFamily:'var(--mono)'}}>{item.dividendYield.toFixed(1)}%</div></div>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </>
      }
    </div>
  );
}