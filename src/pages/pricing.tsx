import React from 'react';
import{useSession}from 'next-auth/react';
import{useApiMutation}from '../hooks/useApi';
import Link from 'next/link';
const PLANS=[
  {id:'FREE',name:'Gratuito',price:0,color:'var(--text-muted)',features:['10 ativos no radar','5 alertas','3 análises IA/dia','Cache 5 min'],limits:['Sem API','Sem white-label']},
  {id:'PRO',name:'Pro',price:97,color:'var(--accent)',highlight:true,badge:'Popular',features:['30 ativos','50 alertas','50 análises IA/dia','Cache 1 min','Backtesting 1 ano'],limits:[]},
  {id:'PREMIUM',name:'Premium',price:197,color:'var(--yellow)',badge:'Completo',features:['100 ativos','Alertas ilimitados','IA ilimitada','Cache 30s','Backtesting 2 anos','Acesso API'],limits:[]},
];
export default function PricingPage(){
  const{data:session}=useSession();
  const checkout=useApiMutation('/api/billing/checkout');
  const handleUpgrade=async(planId:string)=>{
    if(!session?.user?.email)return;
    const res=await checkout.mutate({plan:planId,interval:'monthly',email:session.user.email}) as any;
    if(res?.url)window.location.href=res.url;
  };
  return(<div style={{padding:24,maxWidth:1000,margin:'0 auto'}}>
    <div style={{textAlign:'center',marginBottom:40}}>
      <h1 style={{fontSize:32,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:12}}>Planos QuantRadar</h1>
      <p style={{fontSize:15,color:'var(--text-muted)'}}>Inteligência financeira para todos os perfis</p>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:40}}>
      {PLANS.map(pl=>(
        <div key={pl.id} style={{background:'var(--card)',border:`2px solid ${pl.highlight?'var(--accent)':pl.id==='PREMIUM'?'rgba(255,179,0,.4)':'var(--border)'}`,borderRadius:20,padding:'28px 24px',position:'relative'}}>
          {pl.badge&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:pl.color,color:'var(--bg)',fontSize:11,fontWeight:800,padding:'3px 12px',borderRadius:99}}>{pl.badge}</div>}
          <div style={{fontSize:18,fontWeight:900,color:pl.color,marginBottom:8}}>{pl.name}</div>
          <div style={{fontSize:36,fontWeight:900,color:'var(--text)',letterSpacing:'-0.03em',marginBottom:4}}>{pl.price===0?'Grátis':`R$${pl.price}`}</div>
          {pl.price>0&&<div style={{fontSize:11,color:'var(--text-muted)',marginBottom:20}}>/mês</div>}
          {pl.price===0&&<div style={{marginBottom:20}}/>}
          <ul style={{listStyle:'none',padding:0,margin:'0 0 24px'}}>
            {pl.features.map(f=><li key={f} style={{fontSize:13,color:'var(--text)',padding:'5px 0',display:'flex',gap:8}}><span style={{color:'var(--green)',flexShrink:0}}>✓</span>{f}</li>)}
            {pl.limits.map(f=><li key={f} style={{fontSize:13,color:'var(--text-muted)',padding:'5px 0',display:'flex',gap:8}}><span style={{flexShrink:0}}>✗</span>{f}</li>)}
          </ul>
          {session?.user?.plan===pl.id?
            <div style={{textAlign:'center',padding:'10px',background:'var(--green-dim)',border:'1px solid rgba(0,230,118,.3)',borderRadius:8,color:'var(--green)',fontSize:13,fontWeight:700}}>✓ Plano atual</div>:
            pl.id==='FREE'?
              <Link href="/" style={{display:'block',textAlign:'center',padding:'10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',fontSize:13,textDecoration:'none'}}>Usar grátis</Link>:
              <button onClick={()=>handleUpgrade(pl.id)} disabled={checkout.loading} style={{width:'100%',padding:'12px',background:pl.color,color:'var(--bg)',border:'none',borderRadius:10,fontSize:14,fontWeight:800,cursor:'pointer'}}>Começar agora</button>}
        </div>
      ))}
    </div>
    <div style={{textAlign:'center',fontSize:12,color:'var(--text-muted)'}}>⚠️ Não constitui recomendação de investimento.</div>
  </div>);
}