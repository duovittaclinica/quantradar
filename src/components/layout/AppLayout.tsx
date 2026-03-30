import React,{useState}from 'react';
import Link from 'next/link';
import{useRouter}from 'next/router';
import{useSession,signOut}from 'next-auth/react';
import{MarketTicker}from '../dashboard/MarketTicker';
const NAV=[
  {href:'/',icon:'⚡',label:'Dashboard'},
  {href:'/radar',icon:'🎯',label:'Radar'},
  {href:'/watchlist',icon:'⭐',label:'Watchlist'},
  {href:'/alerts',icon:'🔔',label:'Alertas'},
  {href:'/news',icon:'📰',label:'Notícias'},
  {href:'/backtesting',icon:'📊',label:'Backtesting'},
  {href:'/ai',icon:'🤖',label:'IA'},
  {href:'/compare',icon:'⚖️',label:'Comparar'},
  {href:'/pricing',icon:'💎',label:'Planos'},
];
export default function AppLayout({children}:{children:React.ReactNode}){
  const{data:session}=useSession();
  const router=useRouter();
  const[collapsed,setCollapsed]=useState(false);
  const isAdmin=session?.user?.role==='ADMIN';
  const planColor={'FREE':'var(--text-muted)','PRO':'var(--accent)','PREMIUM':'var(--yellow)','ADMIN':'var(--purple)'}[session?.user?.plan??'FREE']??'var(--text-muted)';
  const W=collapsed?64:220;
  return(
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>
      {/* Sidebar */}
      <div style={{width:W,background:'var(--surface)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',transition:'width .2s',flexShrink:0,position:'sticky',top:0,height:'100vh',overflow:'hidden'}}>
        {/* Logo */}
        <div style={{padding:'18px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={()=>setCollapsed(!collapsed)}>
          <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:'#090B0F',flexShrink:0}}>Q</div>
          {!collapsed&&<span style={{fontSize:16,fontWeight:900,letterSpacing:'-0.02em',color:'var(--text)'}}>QuantRadar</span>}
        </div>
        {/* Nav */}
        <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
          {NAV.map(item=>{
            const active=router.pathname===item.href;
            return(
              <Link key={item.href} href={item.href} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,marginBottom:2,background:active?'var(--accent-dim)':'transparent',color:active?'var(--accent)':'var(--text-muted)',textDecoration:'none',transition:'all .15s',whiteSpace:'nowrap',overflow:'hidden'}}
                onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--card)';e.currentTarget.style.color='var(--text)';}}}
                onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)';}}}
              >
                <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
                {!collapsed&&<span style={{fontSize:13,fontWeight:active?700:500}}>{item.label}</span>}
              </Link>
            );
          })}
          {isAdmin&&(
            <Link href="/admin" style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,marginBottom:2,background:router.pathname==='/admin'?'var(--purple-dim)':'transparent',color:router.pathname==='/admin'?'var(--purple)':'var(--text-muted)',textDecoration:'none',marginTop:8,borderTop:'1px solid var(--border)',paddingTop:16,whiteSpace:'nowrap',overflow:'hidden'}}>
              <span style={{fontSize:16,flexShrink:0}}>⚙️</span>
              {!collapsed&&<span style={{fontSize:13,fontWeight:600}}>Admin</span>}
            </Link>
          )}
        </nav>
        {/* User */}
        {session&&(
          <div style={{padding:'12px 10px',borderTop:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,overflow:'hidden'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'var(--bg)',flexShrink:0}}>
                {(session.user.name??session.user.email??'U')[0].toUpperCase()}
              </div>
              {!collapsed&&<div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{session.user.name??session.user.email?.split('@')[0]}</div>
                <div style={{fontSize:10,fontWeight:700,color:planColor}}>{session.user.plan??'FREE'}</div>
              </div>}
            </div>
            <button onClick={()=>signOut({callbackUrl:'/auth/login'})} style={{width:'100%',padding:collapsed?'7px 0':'7px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:6,color:'var(--text-muted)',fontSize:11,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
              <span>↩</span>{!collapsed&&<span>Sair</span>}
            </button>
          </div>
        )}
      </div>
      {/* Main */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0,overflow:'hidden'}}>
        <MarketTicker/>
        <main style={{flex:1,overflow:'auto'}}>{children}</main>
      </div>
    </div>
  );
}