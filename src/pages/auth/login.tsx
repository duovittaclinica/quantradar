import React,{useState}from 'react';
import{signIn}from 'next-auth/react';
import{useRouter}from 'next/router';
import Link from 'next/link';
export default function LoginPage(){
  const router=useRouter();
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const handleLogin=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);setError('');const res=await signIn('credentials',{email,password,redirect:false});if(res?.ok)router.push('/');else setError(res?.error??'Credenciais inválidas');setLoading(false);};
  const inputStyle={width:'100%',padding:'10px 14px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',boxSizing:'border-box' as const};
  return(
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{width:56,height:56,borderRadius:14,background:'linear-gradient(135deg,#00D4FF,#7C4DFF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:900,color:'#090B0F',margin:'0 auto 16px'}}>Q</div>
          <h1 style={{fontSize:24,fontWeight:900,letterSpacing:'-0.03em',marginBottom:6,color:'var(--text)'}}>Bem-vindo ao QuantRadar</h1>
          <p style={{color:'var(--text-muted)',fontSize:13}}>Inteligência financeira para investidores</p>
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:28}}>
          {error&&<div style={{background:'var(--red-dim)',border:'1px solid rgba(255,61,87,.3)',borderRadius:8,padding:'10px 14px',color:'var(--red)',fontSize:13,marginBottom:20}}>{error}</div>}
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6}}>Email</label><input style={inputStyle} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required /></div>
            <div><label style={{fontSize:12,color:'var(--text-muted)',display:'block',marginBottom:6}}>Senha</label><input style={inputStyle} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required /></div>
            <button type="submit" disabled={loading} style={{padding:'12px',background:loading?'var(--border)':'var(--accent)',color:loading?'var(--text-muted)':'var(--bg)',border:'none',borderRadius:8,fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer'}}>{loading?'Entrando...':'Entrar'}</button>
          </form>
          <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'var(--text-muted)'}}>
            Não tem conta? <Link href="/auth/register" style={{color:'var(--accent)',fontWeight:600}}>Criar conta grátis</Link>
          </div>
        </div>
      </div>
    </div>
  );
}