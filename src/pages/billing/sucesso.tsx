import Link from 'next/link';
import{useRouter}from 'next/router';
import{useEffect,useState}from 'react';
import{useSession}from 'next-auth/react';

export default function BillingSuccess(){
  const{query}=useRouter();
  const plan=String(query.plan||'PRO').toUpperCase();
  const{update}=useSession();
  const[updated,setUpdated]=useState(false);

  useEffect(()=>{
    // Atualiza a sessão após 3s para refletir o novo plano
    const t=setTimeout(async()=>{await update();setUpdated(true);},3000);
    return()=>clearTimeout(t);
  },[]);

  return(
    <div style={{minHeight:'100vh',background:'#0a0e1a',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:24,fontFamily:'sans-serif',padding:24}}>
      <div style={{fontSize:72}}>🎉</div>
      <h1 style={{color:'#00ff88',fontSize:28,fontWeight:800,margin:0,textAlign:'center'}}>Pagamento confirmado!</h1>
      <p style={{color:'#a0aec0',fontSize:17,margin:0,textAlign:'center'}}>
        Seu plano <strong style={{color:'#00d9ff'}}>{plan}</strong> foi ativado com sucesso.
      </p>
      {!updated&&<p style={{color:'#718096',fontSize:13,margin:0}}>Atualizando sua conta...</p>}
      {updated&&<p style={{color:'#00ff88',fontSize:13,margin:0}}>✓ Conta atualizada!</p>}
      <Link href="/" style={{marginTop:8,background:'linear-gradient(135deg,#00d9ff,#00ff88)',color:'#0a0e1a',padding:'14px 36px',borderRadius:10,fontWeight:800,textDecoration:'none',fontSize:16}}>
        Ir ao Dashboard →
      </Link>
    </div>
  );
}