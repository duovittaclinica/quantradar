import React,{useState}from 'react';
import{useRouter}from 'next/router';
import{useAsset,useSignals,useGenerateSignal,useAiExplain,useNews}from '../../hooks/useMarket';
import{useApi}from '../../hooks/useApi';
import{PriceChart}from '../../components/charts/PriceChart';
import Link from 'next/link';
import type{HistoricalDataPoint}from '../../types';
const TAG_CONFIG:Record<string,{bg:string;color:string;label:string}>={
  COMPRA_FORTE:{bg:'var(--green-dim)',color:'var(--green)',label:'🟢 COMPRA FORTE'},
  COMPRA_MODERADA:{bg:'rgba(0,212,255,.1)',color:'var(--accent)',label:'🔵 COMPRA MOD.'},
  AGUARDAR:{bg:'var(--yellow-dim)',color:'var(--yellow)',label:'🟡 AGUARDAR'},
  ALTO_RISCO:{bg:'var(--red-dim)',color:'var(--red)',label:'🔴 ALTO RISCO'},
  VENDA:{bg:'rgba(255,61,87,.2)',color:'var(--red)',label:'🔻 VENDA'},
};
export default function AssetPage(){
  const router=useRouter();
  const ticker=String(router.query.ticker??'').toUpperCase();
  const{data:asset,loading:al,error:ae}=useAsset(ticker||null);
  const{data:histRaw}=useApi<any>(ticker?`/api/quotes?ticker=${ticker}&historical=1`:null);
  const historical:HistoricalDataPoint[]=(histRaw as any)?.historical??[];
  const generateSignal=useGenerateSignal();
  const aiExplain=useAiExplain();
  const{data:news}=useNews(ticker);
  const[aiText,setAiText]=useState<string|null>(null);
  const[generating,setGenerating]=useState(false);
  const handleGenerate=async()=>{setGenerating(true);try{const r=await generateSignal.mutate({ticker});if(r)console.log('Signal generated:',r);}finally{setGenerating(false);}};
  const handleExplain=async()=>{const r=await aiExplain.mutate({ticker});if(r)setAiText(r.analysis);};
  if(al)return<div style={{padding:40,color:'var(--text-muted)',textAlign:'center'}}>Carregando {ticker}...</div>;
  if(ae||!asset)return<div style={{padding:40,color:'var(--red)'}}>Ativo {ticker} não encontrado</div>;
  const q=asset.quote;const t=asset.technicals;const f=asset.fundamentals;
  const tc=TAG_CONFIG.AGUARDAR;
  const priceColor=q.changePercent>=0?'var(--green)':'var(--red)';
  const StatBox=({label,value,color='var(--text)'}:{label:string;value:string|number|undefined;color?:string})=>
    value!=null?<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
      <div style={{fontSize:10,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
      <div style={{fontSize:14,fontWeight:700,color,fontFamily:'var(--mono)'}}>{typeof value==='number'?value.toLocaleString('pt-BR',{maximumFractionDigits:2}):value}</div>
    </div>:null;
  return(<div style={{padding:24}}>
    {/* Header */}
    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24}}>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
          <h1 style={{fontSize:28,fontWeight:900,color:'var(--text)'}}>{ticker}</h1>
          <div style={{padding:'3px 10px',borderRadius:6,background:'var(--accent-dim)',color:'var(--accent)',fontSize:11,fontWeight:700}}>{asset.type}</div>
        </div>
        <div style={{fontSize:14,color:'var(--text-muted)',marginBottom:8}}>{asset.name}{asset.sector&&<span> · {asset.sector}</span>}</div>
        <div style={{display:'flex',alignItems:'baseline',gap:10}}>
          <span style={{fontSize:36,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em'}}>{asset.type==='CRIPTO'?'$':'R$'}{q.price.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
          <span style={{fontSize:16,fontWeight:700,color:priceColor}}>{q.changePercent>=0?'+':''}{q.changePercent.toFixed(2)}%</span>
        </div>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={handleGenerate} disabled={generating} style={{padding:'10px 18px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
          {generating?'Gerando...':'⚡ Gerar Sinal'}
        </button>
        <button onClick={handleExplain} disabled={aiExplain.loading} style={{padding:'10px 18px',background:'var(--purple-dim)',color:'var(--purple)',border:'1px solid var(--purple)44',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
          {aiExplain.loading?'Analisando...':'🤖 Explicar com IA'}
        </button>
      </div>
    </div>
    {/* AI Analysis */}
    {aiText&&(<div style={{background:'var(--card)',border:'1px solid var(--purple)44',borderRadius:12,padding:20,marginBottom:20}}>
      <div style={{fontSize:13,fontWeight:700,color:'var(--purple)',marginBottom:10}}>🤖 Análise IA</div>
      <div style={{fontSize:13,color:'var(--text)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{aiText}</div>
      <button onClick={()=>setAiText(null)} style={{marginTop:10,fontSize:11,color:'var(--text-muted)',background:'none',border:'none',cursor:'pointer'}}>Fechar</button>
    </div>)}
    {/* Price chart */}
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:16}}>
      <PriceChart data={historical} ticker={ticker} height={280}/>
    </div>
    {/* Stats grid */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginBottom:16}}>
      <StatBox label="Abertura" value={'R$'+q.open?.toLocaleString('pt-BR',{minimumFractionDigits:2})}/>
      <StatBox label="Máxima" value={'R$'+q.high?.toLocaleString('pt-BR',{minimumFractionDigits:2})} color="var(--green)"/>
      <StatBox label="Mínima" value={'R$'+q.low?.toLocaleString('pt-BR',{minimumFractionDigits:2})} color="var(--red)"/>
      <StatBox label="Volume" value={(q.volume/1e6).toFixed(1)+'M'}/>
      <StatBox label="RSI(14)" value={t.rsi14.toFixed(1)} color={t.rsi14<30?'var(--green)':t.rsi14>70?'var(--red)':'var(--text)'}/>
      <StatBox label="MA20" value={t.ma20.toLocaleString('pt-BR',{maximumFractionDigits:2})}/>
      <StatBox label="MA50" value={t.ma50.toLocaleString('pt-BR',{maximumFractionDigits:2})}/>
      <StatBox label="ATR" value={t.atr.toFixed(2)}/>
      {f.pl!=null&&<StatBox label="P/L" value={f.pl.toFixed(1)} color={f.pl<15?'var(--green)':f.pl>30?'var(--red)':'var(--text)'}/>}
      {f.pvp!=null&&<StatBox label="P/VP" value={f.pvp.toFixed(2)} color={f.pvp<1?'var(--green)':'var(--text)'}/>}
      {f.dividendYield!=null&&<StatBox label="DY" value={f.dividendYield.toFixed(2)+'%'} color="var(--accent)"/>}
      {f.roe!=null&&<StatBox label="ROE" value={f.roe.toFixed(1)+'%'} color={f.roe>15?'var(--green)':'var(--text)'}/>}
    </div>
    {/* News */}
    {(news as any[])?.length>0&&(<div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20}}>
      <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:12}}>📰 Notícias Recentes</div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {(news as any[]).slice(0,4).map((n:any,i:number)=>(<div key={i} style={{padding:'10px 14px',background:'var(--surface)',borderRadius:8,border:'1px solid var(--border)'}}>
          <div style={{fontSize:12,color:'var(--text)',lineHeight:1.4,marginBottom:4}}>{n.title}</div>
          <div style={{fontSize:10,color:'var(--text-muted)'}}>{n.source} · {new Date(n.publishedAt).toLocaleDateString('pt-BR')}</div>
        </div>))}
      </div>
    </div>)}
  </div>);}