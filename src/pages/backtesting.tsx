import{useState}from 'react';
import{useSession}from 'next-auth/react';
import AppLayout from '../components/layout/AppLayout';

const TICKERS=['PETR4','VALE3','ITUB4','BBDC4','WEGE3','RENT3','ABEV3','B3SA3','PRIO3','RADL3',
  'GGBR4','MXRF11','KNRI11','HGLG11','XPML11','IVVB11','BOVA11','HASH11'];

type BacktestResult={
  ticker:string;profile:string;
  summary:{totalReturn:number;totalTrades:number;wins:number;losses:number;winRate:number;
    avgWin:number;avgLoss:number;sharpeRatio:number;maxDrawdown:number;profitFactor:number;finalEquity:number};
  trades:{entryDate:string;exitDate:string;pnlPercent:number;result:string;holdingDays:number}[];
};

export default function Backtesting(){
  const{data:session}=useSession();
  const[ticker,setTicker]=useState('PETR4');
  const[profile,setProfile]=useState('MODERADO');
  const[minScore,setMinScore]=useState(65);
  const[targetPct,setTargetPct]=useState(8);
  const[stopPct,setStopPct]=useState(4);
  const[result,setResult]=useState<BacktestResult|null>(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState<string|null>(null);

  const runBacktest=async()=>{
    if(!session){setError('Faça login para usar o backtesting');return;}
    setLoading(true);setError(null);setResult(null);
    try{
      const r=await fetch('/api/backtesting/run',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ticker,profile,minScore,targetPct,stopPct}),
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Erro no backtesting');
      setResult(d);
    }catch(e:any){setError(e.message);}
    finally{setLoading(false);}
  };

  const s=result?.summary;

  return(
    <AppLayout>
      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 16px'}}>
        <h1 style={{fontSize:24,fontWeight:700,color:'var(--text)',marginBottom:24}}>
          📊 Backtesting de Estratégias
        </h1>

        {/* Config */}
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:24,marginBottom:24}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:20}}>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6}}>Ativo</label>
              <select value={ticker} onChange={e=>setTicker(e.target.value)}
                style={{width:'100%',background:'var(--surface-hover)',border:'1px solid var(--border)',
                  borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:14}}>
                {TICKERS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6}}>Perfil</label>
              <select value={profile} onChange={e=>setProfile(e.target.value)}
                style={{width:'100%',background:'var(--surface-hover)',border:'1px solid var(--border)',
                  borderRadius:6,padding:'8px 10px',color:'var(--text)',fontSize:14}}>
                {['CONSERVADOR','MODERADO','AGRESSIVO','DIVIDENDOS'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6}}>Score Mínimo: {minScore}</label>
              <input type="range" min={40} max={90} value={minScore} onChange={e=>setMinScore(+e.target.value)}
                style={{width:'100%'}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6}}>Alvo %: {targetPct}%</label>
              <input type="range" min={3} max={20} value={targetPct} onChange={e=>setTargetPct(+e.target.value)}
                style={{width:'100%'}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,color:'var(--text-muted)',marginBottom:6}}>Stop %: {stopPct}%</label>
              <input type="range" min={2} max={15} value={stopPct} onChange={e=>setStopPct(+e.target.value)}
                style={{width:'100%'}}/>
            </div>
          </div>
          <button onClick={runBacktest} disabled={loading}
            style={{background:'var(--primary)',color:'#fff',border:'none',borderRadius:8,
              padding:'12px 32px',fontWeight:700,fontSize:15,cursor:loading?'not-allowed':'pointer',
              opacity:loading?0.7:1,display:'flex',alignItems:'center',gap:8}}>
            {loading?(<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Calculando...</>):'▶ Aplicar Backtesting'}
          </button>
        </div>

        {error&&<div style={{background:'#fed7d7',color:'#c53030',padding:16,borderRadius:8,marginBottom:16}}>{error}</div>}

        {/* Results */}
        {s&&(
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
              {[
                {label:'Retorno Total',value:(s.totalReturn>0?'+':'')+s.totalReturn.toFixed(1)+'%',color:s.totalReturn>=0?'#00ff88':'#ff4757'},
                {label:'Win Rate',value:s.winRate.toFixed(1)+'%',color:s.winRate>=50?'#00ff88':'#ff4757'},
                {label:'Sharpe Ratio',value:s.sharpeRatio.toFixed(2),color:s.sharpeRatio>=1?'#00ff88':'#ffd700'},
                {label:'Max Drawdown',value:s.maxDrawdown.toFixed(1)+'%',color:'#ff4757'},
                {label:'Total Trades',value:String(s.totalTrades),color:'var(--text)'},
                {label:'Ganhos/Perdas',value:s.wins+'/'+s.losses,color:'var(--text)'},
                {label:'Profit Factor',value:s.profitFactor.toFixed(2),color:s.profitFactor>=1.5?'#00ff88':'#ffd700'},
                {label:'Equity Final',value:'R$ '+s.finalEquity.toFixed(0),color:'var(--text)'},
              ].map(m=>(
                <div key={m.label} style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:16}}>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:20,fontWeight:700,color:m.color}}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Trades table */}
            {result.trades.length>0&&(
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:16}}>
                <h3 style={{fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:16}}>Últimos {result.trades.length} Trades</h3>
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                    <thead>
                      <tr style={{borderBottom:'1px solid var(--border)'}}>
                        {['Entrada','Saída','Dias','P&L %','Resultado'].map(h=>(
                          <th key={h} style={{textAlign:'left',padding:'6px 12px',color:'var(--text-muted)',fontWeight:600}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.slice(-15).reverse().map((t,i)=>(
                        <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                          <td style={{padding:'6px 12px',color:'var(--text)'}}>{t.entryDate}</td>
                          <td style={{padding:'6px 12px',color:'var(--text)'}}>{t.exitDate}</td>
                          <td style={{padding:'6px 12px',color:'var(--text)'}}>{t.holdingDays}d</td>
                          <td style={{padding:'6px 12px',color:t.pnlPercent>=0?'#00ff88':'#ff4757',fontWeight:700}}>
                            {t.pnlPercent>0?'+':''}{t.pnlPercent.toFixed(2)}%
                          </td>
                          <td style={{padding:'6px 12px'}}>
                            <span style={{background:t.result==='WIN'?'rgba(0,255,136,0.15)':'rgba(255,71,87,0.15)',
                              color:t.result==='WIN'?'#00ff88':'#ff4757',padding:'2px 8px',borderRadius:4,fontSize:12,fontWeight:700}}>
                              {t.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}