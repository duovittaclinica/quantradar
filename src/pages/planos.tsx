import{useState}from 'react';
import{useSession}from 'next-auth/react';
import{useRouter}from 'next/router';
import AppLayout from '../components/layout/AppLayout';

const PLANS=[
  {
    id:'FREE',label:'FREE',price:0,period:'',
    color:'#4a5568',
    features:['10 ativos monitorados','5 alertas ativos','3 análises IA/dia','Cache 5 min','Backtesting 30 dias'],
    cta:'Criar conta grátis',
  },
  {
    id:'PRO',label:'PRO',price:97,period:'/mês',
    color:'#00d9ff',
    features:['30 ativos monitorados','50 alertas ativos','50 análises IA/dia','Cache 1 min','Backtesting 1 ano','Sinais avançados'],
    cta:'Assinar PRO',
  },
  {
    id:'PREMIUM',label:'PREMIUM',price:197,period:'/mês',
    color:'#a855f7',highlight:true,
    features:['100 ativos monitorados','Alertas ilimitados','IA ilimitada','Cache tempo real','Backtesting 2 anos','Suporte prioritário','API access'],
    cta:'Assinar PREMIUM',
  },
];

export default function Planos(){
  const{data:session}=useSession();
  const router=useRouter();
  const[loading,setLoading]=useState('');
  const[error,setError]=useState('');
  const currentPlan=(session?.user?.plan||'FREE').toUpperCase();

  const subscribe=async(planId:string)=>{
    if(planId==='FREE'){router.push('/auth/register');return;}
    if(!session){router.push('/auth/login?callbackUrl=/planos');return;}
    if(currentPlan===planId)return;
    setLoading(planId);setError('');
    try{
      const r=await fetch('/api/billing/checkout',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({planName:planId}),
      });
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||d.details||'Erro ao iniciar pagamento');
      if(d.checkoutUrl){window.location.href=d.checkoutUrl;}
      else throw new Error('Link de pagamento não retornado pelo PagBank');
    }catch(e:any){setError(e.message);}
    finally{setLoading('');}
  };

  return(
    <AppLayout>
      <div style={{maxWidth:1020,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{textAlign:'center',marginBottom:52}}>
          <h1 style={{fontSize:36,fontWeight:800,color:'var(--text)',margin:'0 0 10px'}}>Escolha seu plano</h1>
          <p style={{color:'var(--text-muted)',fontSize:16,margin:0}}>Inteligência financeira para todos os perfis de investidor</p>
        </div>
        {error&&(
          <div style={{background:'rgba(197,48,48,0.15)',border:'1px solid #c53030',color:'#fc8181',padding:'12px 16px',borderRadius:8,marginBottom:24,textAlign:'center',fontSize:14}}>
            ⚠️ {error}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
          {PLANS.map(p=>{
            const isCurrent=currentPlan===p.id;
            const isLoading=loading===p.id;
            return(
              <div key={p.id} style={{
                background:'var(--surface)',
                border:'2px solid '+(p.highlight?p.color:'var(--border)'),
                borderRadius:16,padding:32,position:'relative',
                boxShadow:p.highlight?'0 0 40px rgba(168,85,247,0.15)':'none',
                transition:'transform .2s',
              }}>
                {isCurrent&&(
                  <span style={{position:'absolute',top:-13,right:16,background:p.color,color:'#fff',fontSize:11,fontWeight:800,padding:'3px 12px',borderRadius:20,letterSpacing:1}}>
                    SEU PLANO
                  </span>
                )}
                {p.highlight&&!isCurrent&&(
                  <span style={{position:'absolute',top:-13,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:11,fontWeight:800,padding:'3px 12px',borderRadius:20,letterSpacing:1,whiteSpace:'nowrap'}}>
                    MAIS POPULAR
                  </span>
                )}
                <div style={{fontSize:11,color:p.color,fontWeight:800,letterSpacing:3,marginBottom:10}}>{p.id}</div>
                <div style={{marginBottom:4}}>
                  <span style={{fontSize:32,fontWeight:900,color:'var(--text)'}}>
                    {p.price===0?'Grátis':'R$'+p.price}
                  </span>
                  <span style={{fontSize:14,color:'var(--text-muted)',marginLeft:2}}>{p.period}</span>
                </div>
                <div style={{borderTop:'1px solid var(--border)',margin:'20px 0',paddingTop:20,display:'flex',flexDirection:'column',gap:9}}>
                  {p.features.map(f=>(
                    <div key={f} style={{display:'flex',gap:8,alignItems:'center',fontSize:13,color:'var(--text-muted)'}}>
                      <span style={{color:'#00ff88',flexShrink:0}}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button
                  onClick={()=>subscribe(p.id)}
                  disabled={isCurrent||!!loading}
                  style={{
                    width:'100%',padding:'13px 0',borderRadius:8,border:'none',
                    fontWeight:800,fontSize:15,cursor:isCurrent||loading?'default':'pointer',
                    background:isCurrent?'var(--border)':p.highlight?'linear-gradient(135deg,#a855f7,#7c3aed)':p.price===0?'var(--surface-hover)':'var(--primary)',
                    color:isCurrent?'var(--text-muted)':'#fff',
                    opacity:loading&&!isLoading?0.5:1,
                    transition:'all .2s',
                  }}
                >
                  {isLoading?'Aguarde...':isCurrent?'Plano atual':p.cta}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{textAlign:'center',marginTop:36,color:'var(--text-muted)',fontSize:12}}>
          🔒 Pagamento processado com segurança pelo <strong>PagBank</strong>. Cancele quando quiser.
        </div>
      </div>
    </AppLayout>
  );
}