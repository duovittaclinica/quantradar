/**
 * Backtesting page — /backtesting
 */
import React,{useState}from 'react';
import{BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,ReferenceLine,LineChart,Line}from 'recharts';
import{useSession}from 'next-auth/react';
import{useBacktest}from '../hooks/useMarket';
import Link from 'next/link';
import type{BacktestResult}from '../services/backtesting/engine';
const PROFILES=['MODERADO','CONSERVADOR','AGRESSIVO','DIVIDENDOS','VALORIZACAO'];
const POPULAR=['PETR4','VALE3','ITUB4','WEGE3','MXRF11','IVVB11'];
function StatCard({label,value,color='var(--text)',sub}:{label:string;value:string|number;color?:string;sub?:string}){
  return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 16px'}}>
    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
    <div style={{fontSize:22,fontWeight:800,color,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{sub}</div>}
  </div>);}
export default function BacktestingPage(){
  const{data:session}=useSession();
  const[ticker,setTicker]=useState('PETR4');
  const[profile,setProfile]=useState('MODERADO');
  const[minScore,setMinScore]=useState(65);
  const[targetPct,setTarget]=useState(8);
  const[stopPct,setStop]=useState(4);
  const{mutate:runTest,loading,data:result}=useBacktest();
  const bt=result as unknown as BacktestResult|null;
  const isPro=session?.user?.plan==='PRO'||session?.user?.plan==='PREMIUM'||session?.user?.role==='ADMIN';
  const handleRun=async()=>{await runTest({ticker,profile,minScore,targetPct,stopPct});};
  if(!session)return<div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Login necessário</div>;
  if(!isPro)return(<div style={{padding:48,textAlign:'center'}}>
    <div style={{fontSize:40,marginBottom:16}}>⏱</div>
    <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>Backtesting — Plano PRO</div>
    <div style={{color:'var(--text-muted)',marginBottom:24}}>Teste estratégias históricas e veja performance dos sinais</div>
    <Link href="/pricing" style={{padding:'12px 24px',background:'var(--accent)',color:'var(--bg)',borderRadius:8,fontWeight:700,textDecoration:'none'}}>Fazer Upgrade</Link>
  </div>);
  const inp={padding:'9px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:12,outline:'none',width:'100%',boxSizing:'border-box' as const};
  const equityData=bt?.trades.reduce((acc:any[],tr,i)=>{const prev=acc[i-1]?.equity??100;return[...acc,{date:tr.exitDate,equity:+(prev*(1+tr.returnPct/100)).toFixed(2)}];},[]as any[])??[];
  return(<div style={{padding:24}}>
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:20}}>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:16}}>⚙️ Configurar</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Ticker</label><input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} style={inp}/></div>
          <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Perfil</label><select value={profile} onChange={e=>setProfile(e.target.value)} style={{...inp,cursor:'pointer'}}>{PROFILES.map(p=><option key={p}>{p}</option>)}</select></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
            <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Score</label><input type="number" value={minScore} onChange={e=>setMinScore(Number(e.target.value))} style={inp}/></div>
            <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Alvo %</label><input type="number" value={targetPct} onChange={e=>setTarget(Number(e.target.value))} style={inp}/></div>
            <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Stop %</label><input type="number" value={stopPct} onChange={e=>setStop(Number(e.target.value))} style={inp}/></div>
          </div>
          <button onClick={handleRun} disabled={loading} style={{padding:'10px 16px',background:loading?'var(--border)':'var(--accent)',color:loading?'var(--text-muted)':'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>{loading?'Simulando...':'▶ Executar Backtest'}</button>
        </div>
      </div>
      <div>
        {loading&&<div style={{padding:60,textAlign:'center',color:'var(--text-muted)'}}>Processando histórico de {ticker}...</div>}
        {!loading&&!bt&&<div style={{padding:60,textAlign:'center',color:'var(--text-muted)'}}>Configure e execute o backtest</div>}
        {!loading&&bt&&<div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
            <StatCard label="Taxa de Acerto" value={(bt.stats.winRate*100).toFixed(1)+'%'} color={bt.stats.winRate>0.6?'var(--green)':bt.stats.winRate>0.4?'var(--yellow)':'var(--red)'}/>
            <StatCard label="Retorno Total" value={(bt.stats.totalReturn>0?'+':'')+bt.stats.totalReturn+'%'} color={bt.stats.totalReturn>0?'var(--green)':'var(--red)'}/>
            <StatCard label="Max Drawdown" value={'-'+bt.stats.maxDrawdown+'%'} color="var(--red)"/>
            <StatCard label="Sharpe" value={bt.stats.sharpe} color={bt.stats.sharpe>1?'var(--green)':'var(--text)'}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            <StatCard label="Trades" value={bt.stats.totalTrades}/>
            <StatCard label="Vitórias" value={bt.stats.wins} color="var(--green)"/>
            <StatCard label="Derrotas" value={bt.stats.losses} color="var(--red)"/>
            <StatCard label="Profit Factor" value={bt.stats.profitFactor} color={bt.stats.profitFactor>=1.5?'var(--green)':'var(--text)'}/>
          </div>
          {equityData.length>1&&<div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:12}}>Curva de Capital (base 100)</div>
            <ResponsiveContainer width="100%" height={180}><LineChart data={equityData}><XAxis dataKey="date" tick={{fill:'var(--text-muted)',fontSize:10}} tickLine={false} axisLine={false} interval={Math.floor(equityData.length/6)}/><YAxis tick={{fill:'var(--text-muted)',fontSize:10}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,fontSize:12}}/><ReferenceLine y={100} stroke="var(--border)" strokeDasharray="4 2"/><Line type="monotone" dataKey="equity" stroke="var(--accent)" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer>
          </div>}
          <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:13,fontWeight:700,color:'var(--text)'}}>Log de Trades</div>
            <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead><tr style={{background:'var(--surface)'}}>{['Entrada','Saída','Preço In','Preço Out','Retorno','Dias','Score','Motivo'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',color:'var(--text-muted)',fontWeight:600}}>{h}</th>)}</tr></thead>
              <tbody>{bt.trades.slice(0,25).map((tr,i)=>(
                <tr key={i} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'transparent':'var(--surface)'}}>
                  <td style={{padding:'7px 10px',color:'var(--text-muted)',fontSize:11}}>{tr.entryDate}</td>
                  <td style={{padding:'7px 10px',color:'var(--text-muted)',fontSize:11}}>{tr.exitDate}</td>
                  <td style={{padding:'7px 10px',fontFamily:'var(--mono)'}}>R${tr.entryPrice.toFixed(2)}</td>
                  <td style={{padding:'7px 10px',fontFamily:'var(--mono)'}}>R${tr.exitPrice.toFixed(2)}</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:tr.returnPct>0?'var(--green)':'var(--red)',fontFamily:'var(--mono)'}}>{tr.returnPct>0?'+':''}{tr.returnPct.toFixed(2)}%</td>
                  <td style={{padding:'7px 10px',color:'var(--text-muted)'}}>{tr.holdingDays}d</td>
                  <td style={{padding:'7px 10px',fontWeight:700,color:'var(--accent)'}}>{tr.signalScore}</td>
                  <td style={{padding:'7px 10px',fontSize:11,color:tr.exitReason==='target'?'var(--green)':tr.exitReason==='stop'?'var(--red)':'var(--text-muted)'}}>{tr.exitReason}</td>
                </tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>}
      </div>
    </div>
  </div>);}