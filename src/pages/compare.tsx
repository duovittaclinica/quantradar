import React,{useState}from 'react';
import{useApi}from '../hooks/useApi';
import{AreaChart,Area,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend}from 'recharts';
const COLORS=['var(--accent)','var(--green)','var(--yellow)','var(--purple)'];
export default function ComparePage(){
  const[tickers,setTickers]=useState<string[]>(['PETR4','VALE3']);
  const[input,setInput]=useState('');
  const tickerList=tickers.join(',');
  const{data:assets,loading}=useApi<any[]>(tickers.length>0?`/api/quotes?tickers=${tickerList}`:null);
  const addTicker=()=>{const t=input.trim().toUpperCase();if(t&&!tickers.includes(t)&&tickers.length<4){setTickers([...tickers,t]);setInput('');}};
  const removeTicker=(t:string)=>setTickers(tickers.filter(x=>x!==t));
  const metrics=['price','changePercent','rsi14','dividendYield','pvp','pl'] as const;
  const metricLabels:Record<string,string>={price:'Preço',changePercent:'Variação %',rsi14:'RSI(14)',dividendYield:'Dividend Yield',pvp:'P/VP',pl:'P/L'};
  const getValue=(asset:any,m:string):number|null=>{if(m==='price')return asset?.quote?.price;if(m==='changePercent')return asset?.quote?.changePercent;if(m==='rsi14')return asset?.technicals?.rsi14;return asset?.fundamentals?.[m]??null;};
  const chartData=Array.from({length:20},(_,i)=>{const pt:any={day:`D-${20-i}`};(assets??[]).forEach((a:any)=>{if(a)pt[a.ticker]=a.quote.price*(0.94+Math.random()*0.12+i*0.003);});return pt;});
  return(<div style={{padding:24}}>
    <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)',marginBottom:20}}>⚖️ Comparar Ativos</h1>
    <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
      <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&addTicker()} placeholder="Adicionar ativo (ex: ITUB4)" style={{padding:'8px 14px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',minWidth:200}}/>
      <button onClick={addTicker} disabled={tickers.length>=4} style={{padding:'8px 16px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Adicionar</button>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {tickers.map((t,i)=>(<div key={t} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 10px',background:'var(--surface)',border:`2px solid ${COLORS[i]}`,borderRadius:20,fontSize:12,fontWeight:700,color:COLORS[i]}}>{t}<button onClick={()=>removeTicker(t)} style={{background:'none',border:'none',color:COLORS[i],cursor:'pointer',fontSize:14,lineHeight:1,padding:0,marginLeft:2}}>×</button></div>))}
      </div>
    </div>
    {loading&&<div style={{color:'var(--text-muted)',fontSize:13}}>Carregando...</div>}
    {!loading&&assets&&<>
      {/* Chart */}
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:12}}>Desempenho Relativo (Simulado)</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <XAxis dataKey="day" tick={{fill:'var(--text-muted)',fontSize:10}} tickLine={false} axisLine={false}/>
            <YAxis tick={{fill:'var(--text-muted)',fontSize:10}} tickLine={false} axisLine={false} width={70} tickFormatter={v=>v.toLocaleString('pt-BR',{maximumFractionDigits:0})}/>
            <Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12}}/>
            {tickers.map((t,i)=><Area key={t} type="monotone" dataKey={t} stroke={COLORS[i]} strokeWidth={2} fill="none" dot={false}/>)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Metrics table */}
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr style={{borderBottom:'1px solid var(--border)'}}>
            <th style={{padding:'12px 16px',textAlign:'left',fontSize:12,color:'var(--text-muted)',fontWeight:600}}>Métrica</th>
            {tickers.map((t,i)=><th key={t} style={{padding:'12px 16px',textAlign:'center',fontSize:13,fontWeight:800,color:COLORS[i]}}>{t}</th>)}
          </tr></thead>
          <tbody>
            {metrics.map(m=>{
              const vals=assets.map((a:any)=>getValue(a,m));
              const max=Math.max(...vals.filter(v=>v!==null) as number[]);
              return(<tr key={m} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'10px 16px',fontSize:12,color:'var(--text-muted)',fontWeight:600}}>{metricLabels[m]}</td>
                {vals.map((v,i)=>(<td key={i} style={{padding:'10px 16px',textAlign:'center',fontSize:13,fontWeight:v===max?800:500,color:v===max?'var(--green)':'var(--text)',fontFamily:'var(--mono)'}}>
                  {v===null?'—':m==='price'?'R$'+v.toLocaleString('pt-BR',{minimumFractionDigits:2}):m==='changePercent'||m==='dividendYield'?v.toFixed(2)+'%':v.toFixed(2)}
                </td>))}
              </tr>);
            })}
          </tbody>
        </table>
      </div>
    </>}
  </div>);}