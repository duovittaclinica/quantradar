import React,{useState}from 'react';
import{useSession,signOut}from 'next-auth/react';
import{useApiMutation}from '../hooks/useApi';
import Link from 'next/link';
const PROFILES=[{v:'CONSERVADOR',l:'Conservador — Prefere segurança e renda'},
  {v:'MODERADO',l:'Moderado — Equilíbrio entre risco e retorno'},
  {v:'AGRESSIVO',l:'Agressivo — Foco em crescimento'},
  {v:'DIVIDENDOS',l:'Dividendos — Renda passiva'},
  {v:'VALORIZACAO',l:'Valorização — Crescimento de longo prazo'}];
const PLANS=[
  {n:'FREE',p:'R$0/mês',features:['10 ativos no radar','5 alertas ativos','3 análises IA/dia','Cache 5 min']},
  {n:'PRO',p:'R$97/mês',features:['30 ativos no radar','50 alertas ativos','50 análises IA/dia','Cache 1 min','Backtesting 1 ano'],highlight:true},
  {n:'PREMIUM',p:'R$197/mês',features:['100 ativos','Alertas ilimitados','IA ilimitada','Cache 30s','Backtesting 2 anos','Acesso à API']},
];
export default function SettingsPage(){
  const{data:session}=useSession();
  const[profile,setProfile]=useState(session?.user?.profile??'MODERADO');
  const[saved,setSaved]=useState(false);
  const updateProfile=useApiMutation<{profile:string},{}>('/api/auth/upgrade');
  const handleSave=async()=>{
    await updateProfile.mutate({profile});
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };
  const inp={width:'100%',padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',boxSizing:'border-box' as const};
  return(<div style={{padding:24,maxWidth:800}}>
    <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)',marginBottom:24}}>⚙️ Configurações</h1>
    {/* Profile */}
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:24,marginBottom:20}}>
      <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16}}>Perfil do Investidor</h2>
      <select value={profile} onChange={e=>setProfile(e.target.value)} style={{...inp,marginBottom:16,cursor:'pointer'}}>
        {PROFILES.map(p=><option key={p.v} value={p.v}>{p.l}</option>)}
      </select>
      <div style={{display:'flex',gap:10,alignItems:'center'}}>
        <button onClick={handleSave} disabled={updateProfile.loading} style={{padding:'10px 24px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
          {updateProfile.loading?'Salvando...':'Salvar Perfil'}
        </button>
        {saved&&<span style={{color:'var(--green)',fontSize:13}}>✓ Salvo!</span>}
      </div>
    </div>
    {/* Account */}
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:24,marginBottom:20}}>
      <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16}}>Conta</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6}}>Email</label><div style={{...inp,background:'var(--surface)',cursor:'default',opacity:.6}}>{session?.user?.email}</div></div>
        <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6}}>Plano Atual</label><div style={{...inp,background:'var(--surface)',cursor:'default',color:'var(--accent)',fontWeight:700}}>{session?.user?.plan??'FREE'}</div></div>
      </div>
      <button onClick={()=>signOut({callbackUrl:'/auth/login'})} style={{padding:'8px 20px',background:'var(--red-dim)',border:'1px solid var(--red)',borderRadius:8,color:'var(--red)',fontSize:13,fontWeight:600,cursor:'pointer'}}>Sair da conta</button>
    </div>
    {/* Plans */}
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:24}}>
      <h2 style={{fontSize:16,fontWeight:700,color:'var(--text)',marginBottom:16}}>Planos Disponíveis</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {PLANS.map(plan=>(<div key={plan.n} style={{border:`2px solid ${plan.highlight?'var(--accent)':'var(--border)'}`,borderRadius:12,padding:'18px 16px',background:plan.highlight?'var(--accent-dim)':'var(--surface)',position:'relative'}}>
          {plan.highlight&&<div style={{position:'absolute',top:-10,left:'50%',transform:'translateX(-50%)',background:'var(--accent)',color:'var(--bg)',fontSize:10,fontWeight:800,padding:'2px 10px',borderRadius:99}}>MAIS POPULAR</div>}
          <div style={{fontSize:16,fontWeight:900,color:'var(--text)'}}>{plan.n}</div>
          <div style={{fontSize:22,fontWeight:900,color:plan.highlight?'var(--accent)':'var(--text)',margin:'8px 0'}}>{plan.p}</div>
          <ul style={{listStyle:'none',padding:0,margin:'0 0 16px'}}>
            {plan.features.map(f=><li key={f} style={{fontSize:12,color:'var(--text-muted)',padding:'3px 0',display:'flex',gap:6}}><span style={{color:'var(--green)'}}>✓</span>{f}</li>)}
          </ul>
          {session?.user?.plan===plan.n?<div style={{textAlign:'center',fontSize:12,color:'var(--green)',fontWeight:700}}>Plano atual</div>:<Link href="/pricing" style={{display:'block',textAlign:'center',padding:'8px',background:plan.highlight?'var(--accent)':'var(--surface)',color:plan.highlight?'var(--bg)':'var(--accent)',border:`1px solid ${plan.highlight?'var(--accent)':'var(--border)'}`,borderRadius:8,fontSize:13,fontWeight:700,textDecoration:'none'}}>Ver plano</Link>}
        </div>))}
      </div>
    </div>
  </div>);}