/**
 * Dashboard page — /
 */
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRadar, useNews } from '../hooks/useMarket';
import Link from 'next/link';
import type { RadarEntry } from '../types';
const ibovHistory = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  return { date: d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }), val: 124000 + Math.sin(i/3)*2000 + i*120 };
});
const SECTORS = [
  { name:'Energia', score:82 }, { name:'FIIs', score:78 },
  { name:'Cripto', score:71 }, { name:'Industrial', score:66 },
  { name:'Financeiro', score:54 }, { name:'Mineração', score:48 },
];
export default function DashboardPage() {
  const { data: radar, loading: rl } = useRadar('MODERADO', undefined, 0);
  const { data: news, loading: nl } = useNews();
  const top = (radar as RadarEntry[])?.slice(0, 4) ?? [];
  const opp = (radar as RadarEntry[])?.filter(r=>r.score>=75).length ?? 0;
  const avg = Math.round(((radar as RadarEntry[])?.reduce((s,r)=>s+r.score,0)??0)/((radar as RadarEntry[])?.length||1));
  const pct = Math.round(((radar as RadarEntry[])?.filter(r=>r.changePercent>=0).length??0)/((radar as RadarEntry[])?.length||1)*100);
  const KPI = ({label,value,sub,color,icon}:{label:string;value:string;sub:string;color:string;icon:string}) => (
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><span style={{fontSize:18}}>{icon}</span><span style={{fontSize:11,color:'var(--text-muted)'}}>{label}</span></div>
      <div style={{fontSize:26,fontWeight:900,color,letterSpacing:'-0.03em'}}>{value}</div>
      <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{sub}</div>
    </div>
  );
  return (
    <div style={{padding:24}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        <KPI label="Oportunidades" value={rl?'—':String(opp)} sub="+3 vs ontem" color="var(--green)" icon="🎯"/>
        <KPI label="Score Médio" value={rl?'—':String(avg)} sub="Moderado positivo" color="var(--accent)" icon="📊"/>
        <KPI label="Ativos em Alta" value={rl?'—':`${pct}%`} sub="Dos monitorados" color="var(--green)" icon="📈"/>
        <KPI label="Alertas Ativos" value="12" sub="2 críticos" color="var(--yellow)" icon="🔔"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16,marginBottom:16}}>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20}}>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>IBOVESPA</div>
            <div style={{fontSize:30,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em'}}>127.842</div>
            <span style={{fontSize:13,color:'var(--green)',fontWeight:700}}>+1,24%</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ibovHistory}>
              <defs><linearGradient id="ibovG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3}/><stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="date" hide/><YAxis hide domain={['auto','auto']}/>
              <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}} formatter={(v:any)=>[v.toLocaleString('pt-BR'),'IBOV']}/>
              <Area type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={2} fill="url(#ibovG)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:16,color:'var(--text)'}}>Score por Setor</div>
          {SECTORS.map(s=>{const c=s.score>=75?'var(--green)':s.score>=60?'var(--yellow)':'var(--red)';return(<div key={s.name} style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span style={{color:'var(--text-muted)'}}>{s.name}</span><span style={{color:c,fontWeight:700}}>{s.score}</span></div><div style={{height:4,background:'var(--border)',borderRadius:99}}><div style={{width:s.score+'%',height:'100%',background:c,borderRadius:99}}/></div></div>);})}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:'var(--text)'}}>⚡ Melhores Oportunidades</div>
          {rl?<div style={{color:'var(--text-muted)',fontSize:13}}>Carregando...</div>:
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {top.map((e:RadarEntry)=>(
                <Link key={e.ticker} href={'/asset/'+e.ticker} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 12px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)',textDecoration:'none'}}>
                  <div style={{width:40,height:40,borderRadius:8,border:'2px solid var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'var(--accent)',flexShrink:0}}>{e.score}</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:'var(--text)'}}>{e.ticker}</div><div style={{fontSize:11,color:'var(--text-muted)'}}>{e.name}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontWeight:700,fontSize:13,color:'var(--text)'}}>R${e.price.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div><div style={{fontSize:11,color:e.changePercent>=0?'var(--green)':'var(--red)',fontWeight:700}}>{e.changePercent>=0?'+':''}{e.changePercent.toFixed(2)}%</div></div>
                </Link>
              ))}
              <Link href="/radar" style={{textAlign:'center',fontSize:12,color:'var(--accent)',display:'block',marginTop:4,textDecoration:'none'}}>Ver radar completo →</Link>
            </div>}
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:'var(--text)'}}>📰 Notícias</div>
          {nl?<div style={{color:'var(--text-muted)',fontSize:13}}>Carregando...</div>:
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {((news as any[])??[]).slice(0,4).map((n:any,i:number)=>(
                <div key={i} style={{padding:'10px 12px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{display:'flex',gap:8,marginBottom:6,alignItems:'center'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',flexShrink:0,background:n.sentiment==='positivo'?'var(--green)':n.sentiment==='negativo'?'var(--red)':'var(--yellow)'}}/>
                    <span style={{fontSize:10,color:'var(--text-muted)',marginLeft:'auto'}}>{n.source}</span>
                  </div>
                  <div style={{fontSize:12,color:'var(--text)',lineHeight:1.4}}>{n.title}</div>
                </div>
              ))}
              <Link href="/news" style={{textAlign:'center',fontSize:12,color:'var(--accent)',display:'block',marginTop:4,textDecoration:'none'}}>Ver todas →</Link>
            </div>}
        </div>
      </div>
    </div>
  );
}