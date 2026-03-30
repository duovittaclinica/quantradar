import{useState}from 'react';
import{useSession}from 'next-auth/react';
import{useRouter}from 'next/router';
import AppLayout from '../components/layout/AppLayout';

const PLANS=[
  {id:'FREE',label:'FREE',price:0,period:'',color:'#4a5568',features:['10 ativos monitorados','5 alertas ativos','3 análises IA/dia','Cache 5 min','Backtesting 30 dias'],cta:'Criar conta grátis',href:'/auth/register'},
  {id:'PRO',label:'PRO',price:97,period:'/mês',color:'#00d9ff',features:['30 ativos monitorados','50 alertas ativos','50 análises IA/dia','Cache 1 min','Backtesting 1 ano','Sinais avançados'],cta:'Assinar PRO',highlight:false},
  {id:'PREMIUM',label:'PREMIUM',price:197,period:'/mês',color:'#a855f7',features:['100 ativos monitorados','Alertas ilimitados','IA ilimitada','Cache em tempo real','Backtesting 2 anos','Suporte prioritário','API access'],cta:'Assinar PREMIUM',highlight:true},
];

export default function Planos(){
  const{data:session}=useSession();
  const router=useRouter();
  const[loading,setLoading]=useState<string|null>(null);
  const[error,setError]=useState<string|null>(null);

  const handleSubscribe=async(planId:string)=>{
    if(planId==='FREE'){router.push('/auth/register');return;}
    if(!session){router.push('/auth/login');return;}
    setLoading(planId);setError(null);
    try{
      const r=await fetch('/api/billing/checkout',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({planName:planId}),
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Erro ao criar pagamento');
      if(d.checkoutUrl){window.location.href=d.checkoutUrl;}
      else throw new Error('URL de checkout não retornada');
    }catch(e:any){setError(e.message);}
    finally{setLoading(null);}
  };

  const currentPlan=session?.user?.plan||'FREE';

  return(
    <AppLayout>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'40px 24px'}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <h1 style={{fontSize:36,fontWeight:700,color:'var(--text)',marginBottom:8}}>Escolha seu plano</h1>
          <p style={{color:'var(--text-muted)',fontSize:16}}>Inteligência financeira para todos os perfis de investidor</p>
        </div>
        {error&&<div style={{background:'#fed7d7',color:'#c53030',padding:'12px 16px',borderRadius:8,marginBottom:24,textAlign:'center'}}>{error}</div>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {PLANS.map(plan=>{
            const isCurrent=currentPlan===plan.id;
            return(
              <div key={plan.id} style={{
                background:'var(--surface)',border:`2px solid ${plan.highlight?plan.color:'var(--border)'}`,
                borderRadius:16,padding:32,position:'relative',
                boxShadow:plan.highlight?'0 0 30px rgba(168,85,247,0.2)':'none',
              }}>
                {isCurrent&&<div style={{position:'absolute',top:-12,right:16,background:plan.color,color:'#fff',fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:20}}>SEU PLANO</div>}
                <div style={{fontSize:12,color:plan.color,fontWeight:700,letterSpacing:2,marginBottom:8}}>{plan.id}</div>
                <div style={{fontSize:28,fontWeight:800,color:'var(--text)',marginBottom:4}}>
                  {plan.price===0?'Grátis':`R$${plan.price}`}<span style={{fontSize:14,fontWeight:400,color:'var(--text-muted)'}}>{plan.period}</span>
                </div>
                <div style={{borderTop:'1px solid var(--border)',margin:'20px 0',paddingTop:20}}>
                  {plan.features.map(f=>(
                    <div key={f} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,fontSize:13,color:'var(--text-muted)'}}>
                      <span style={{color:'#00ff88'}}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={()=>handleSubscribe(plan.id)}
                  disabled={isCurrent||loading===plan.id}
                  style={{
                    width:'100%',padding:'12px 0',borderRadius:8,border:'none',
                    fontWeight:700,fontSize:15,cursor:isCurrent?'default':'pointer',
                    background:isCurrent?'var(--border)':plan.highlight?plan.color:plan.price===0?'var(--surface-hover)':'var(--primary)',
                    color:isCurrent?'var(--text-muted)':'#fff',
                    opacity:loading&&loading!==plan.id?0.6:1,
                    transition:'all .2s',
                  }}
                >{loading===plan.id?'Aguarde...':isCurrent?'Plano atual':plan.cta}</button>
              </div>
            );
          })}
        </div>
        <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:12,marginTop:32}}>
          Pagamento processado com segurança pelo PagBank. Cancele quando quiser.
        </p>
      </div>
    </AppLayout>
  );
}