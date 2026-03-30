import{useEffect}from 'react';
import{useRouter}from 'next/router';
import Link from 'next/link';
export default function BillingSuccess(){
  const router=useRouter();
  const{plan}=router.query;
  return(
    <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'var(--font-sans)'}}>
      <div style={{fontSize:64}}>🎉</div>
      <h1 style={{color:'#00ff88',fontSize:32,fontWeight:700,margin:0}}>Pagamento confirmado!</h1>
      <p style={{color:'#a0aec0',fontSize:18,margin:0}}>
        Seu plano <strong style={{color:'#00d9ff'}}>{plan||'PRO'}</strong> foi ativado com sucesso.
      </p>
      <p style={{color:'#718096',fontSize:14,margin:0}}>O upgrade pode levar alguns segundos para aparecer.</p>
      <Link href="/" style={{marginTop:16,background:'#00d9ff',color:'#0a0e1a',padding:'12px 32px',borderRadius:8,fontWeight:700,textDecoration:'none',fontSize:16}}>
        Ir ao Dashboard →
      </Link>
    </div>
  );
}