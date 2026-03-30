import{useState}from 'react';
import{useSession}from 'next-auth/react';
import{useRouter}from 'next/router';
import Head from 'next/head';
export default function Planos(){
  const{data:session}=useSession();
  const router=useRouter();
  const[loading,setLoading]=useState<string|null>(null);
  const[error,setError]=useState<string|null>(null);
  const plans=[
    {id:'FREE',name:'FREE',price:'Grátis',priceNum:0,color:'#6b7280',
     features:['10 ativos monitorados','5 alertas ativos','3 análises IA/dia','Cache 5 min','Backtesting 30 dias'],
     cta:'Criar conta grátis',ctaHref:'/auth/register'},
    {id:'PRO',name:'PRO',price:'R$97/mês',priceNum:97,color:'#06b6d4',
     features:['30 ativos monitorados','50 alertas ativos','50 análises IA/dia','Cache 1 min','Backtesting 1 ano','Sinais avançados'],
     cta:'Assinar PRO',ctaHref:null},
    {id:'PREMIUM',name:'PREMIUM',price:'R$197/mês',priceNum:197,color:'#a855f7',
     features:['100 ativos monitorados','Alertas ilimitados','IA ilimitada','Cache em tempo real','Backtesting 2 anos','Suporte prioritário','API access'],
     cta:'Assinar PREMIUM',ctaHref:null},
  ];
  const handleBuy=async(planId:string)=>{
    if(!session){router.push('/auth/register');return;}
    setLoading(planId);setError(null);
    try{
      const r=await fetch('/api/billing/checkout',{method:'POST',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:planId})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Erro ao criar checkout');
      if(d.url)window.open(d.url,'_blank');
      else throw new Error('URL de checkout não retornada');
    }catch(e:any){setError(e.message);}
    finally{setLoading(null);}
  };
  const currentPlan=session?.user?.plan||'FREE';
  return(
    <>
    <Head><title>Planos — QuantRadar</title></Head>
    <div style={{minHeight:'100vh',background:'var(--bg)',padding:'48px 24px'}}>
      <div style={{maxWidth:960,margin:'0 auto'}}>
        <h1 style={{textAlign:'center',fontSize:32,fontWeight:700,color:'var(--text)',marginBottom:8}}>Escolha seu plano</h1>
        <p style={{textAlign:'center',color:'var(--text-muted)',marginBottom:48}}>Inteligência financeira para todos os perfis de investidor</p>
        {error&&<div style={{background:'#ff000020',border:'1px solid #ff0000',borderRadius:8,padding:'12px 16px',marginBottom:24,color:'#ff6b6b',textAlign:'center'}}>{error}</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
          {plans.map(p=>{
            const isCurrent=currentPlan===p.id;
            const isLoading=loading===p.id;
            return(
              <div key={p.id} style={{background:'var(--surface)',border:`2px solid ${isCurrent?p.color:'var(--border)'}`,borderRadius:16,padding:32,display:'flex',flexDirection:'column',gap:16,position:'relative'}}>
                {isCurrent&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>SEU PLANO</div>}
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:p.color,letterSpacing:2,marginBottom:4}}>{p.name}</div>
                  <div style={{fontSize:28,fontWeight:700,color:'var(--text)'}}>{p.price}</div>
                </div>
                <ul style={{listStyle:'none',padding:0,margin:0,display:'flex',flexDirection:'column',gap:8,flex:1}}>
                  {p.features.map(f=>(
                    <li key={f} style={{fontSize:13,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:8}}>
                      <span style={{color:p.color}}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={()=>p.ctaHref?router.push(p.ctaHref):handleBuy(p.id)}
                  disabled={isCurrent||isLoading}
                  style={{width:'100%',padding:'12px 0',borderRadius:8,border:'none',cursor:isCurrent||isLoading?'not-allowed':'pointer',
                    background:isCurrent?'var(--border)':p.color,color:isCurrent?'var(--text-muted)':'#fff',
                    fontWeight:700,fontSize:14,opacity:isCurrent?0.7:1,transition:'opacity .2s'}}>
                  {isLoading?'Processando...':(isCurrent?'Plano atual':p.cta)}
                </button>
              </div>
            );
          })}
        </div>
        <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:12,marginTop:32}}>
          Pagamento processado com segurança pelo AppMax. Cancele quando quiser.
        </p>
      </div>
    </div>
    </>
  );
}