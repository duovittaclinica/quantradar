import React,{useState,useRef,useEffect}from 'react';
import{useSession}from 'next-auth/react';
import{useAiExplain,useAiChat,useRadar}from '../hooks/useMarket';
import Link from 'next/link';
function ChatBubble({role,content}:{role:string;content:string}){
  const isUser=role==='user';
  return(<div style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',marginBottom:12}}>
    {!isUser&&<div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--purple))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'var(--bg)',flexShrink:0,marginRight:8,marginTop:2}}>Q</div>}
    <div style={{maxWidth:'75%',padding:'10px 14px',borderRadius:isUser?'12px 12px 0 12px':'12px 12px 12px 0',background:isUser?'var(--accent)':'var(--card)',color:isUser?'var(--bg)':'var(--text)',border:isUser?'none':'1px solid var(--border)',fontSize:13,lineHeight:1.6}}>{content}</div>
  </div>);}
export default function AIPage(){
  const{data:session}=useSession();
  const{data:radar}=useRadar('MODERADO');
  const[ticker,setTicker]=useState('');
  const[question,setQuestion]=useState('');
  const[chatMsg,setChatMsg]=useState('');
  const[tab,setTab]=useState<'explain'|'chat'>('explain');
  const chatRef=useRef<HTMLDivElement>(null);
  const{mutate:explain,loading:explaining,data:analysis}=useAiExplain();
  const{messages,send,loading:chatLoading}=useAiChat(ticker||undefined);
  const isPro=session?.user?.plan==='PRO'||session?.user?.plan==='PREMIUM'||session?.user?.role==='ADMIN';
  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:'smooth'});},[messages]);
  if(!session)return<div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Login necessário</div>;
  const inp={flex:1,padding:'10px 14px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none'};
  return(<div style={{padding:24}}>
    <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:20}}>
      <div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text-muted)',marginBottom:10}}>SELECIONAR ATIVO</div>
          <input value={ticker} onChange={e=>setTicker(e.target.value.toUpperCase())} placeholder="Ex: PETR4" style={{...inp,display:'block',width:'100%',boxSizing:'border-box' as const,marginBottom:12}}/>
          <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:280,overflowY:'auto'}}>
            {((radar as any[])??[]).slice(0,10).map((a:any)=>(
              <button key={a.ticker} onClick={()=>setTicker(a.ticker)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:8,background:ticker===a.ticker?'var(--accent-dim)':'transparent',border:`1px solid ${ticker===a.ticker?'rgba(0,212,255,.2)':'transparent'}`,cursor:'pointer',textAlign:'left'}}>
                <div style={{width:32,height:32,borderRadius:6,border:`2px solid ${a.score>=75?'var(--green)':a.score>=55?'var(--yellow)':'var(--red)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:a.score>=75?'var(--green)':a.score>=55?'var(--yellow)':'var(--red)',flexShrink:0}}>{a.score}</div>
                <div><div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{a.ticker}</div><div style={{fontSize:10,color:'var(--text-muted)'}}>{a.type}</div></div>
              </button>
            ))}
          </div>
        </div>
        {(analysis as any)?.usageRemaining!==undefined&&<div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 16px',fontSize:12}}>
          <div style={{color:'var(--text-muted)',marginBottom:4}}>Análises hoje</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--accent)'}}>{(analysis as any).usageRemaining} restantes</div>
        </div>}
      </div>
      <div>
        <div style={{display:'flex',gap:0,background:'var(--card)',border:'1px solid var(--border)',borderRadius:'12px 12px 0 0',overflow:'hidden'}}>
          {(['explain','chat']as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'12px',fontSize:13,fontWeight:600,cursor:'pointer',background:tab===t?'var(--accent-dim)':'transparent',color:tab===t?'var(--accent)':'var(--text-muted)',border:'none',borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`}}>
              {t==='explain'?'🔍 Análise':'💬 Chat'}
            </button>
          ))}
        </div>
        <div style={{background:'var(--card)',border:'1px solid var(--border)',borderTop:'none',borderRadius:'0 0 12px 12px',padding:20}}>
          {tab==='explain'&&<>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Pergunta específica (opcional)" style={inp} onKeyDown={e=>e.key==='Enter'&&ticker&&explain({ticker,question:question||undefined})}/>
              <button onClick={()=>ticker&&explain({ticker,question:question||undefined})} disabled={!ticker||explaining} style={{padding:'10px 20px',background:!ticker?'var(--border)':'var(--accent)',color:!ticker?'var(--text-muted)':'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {explaining?'Analisando...':`Analisar ${ticker||'(selecione)'}`}
              </button>
            </div>
            {explaining&&<div style={{padding:60,textAlign:'center',color:'var(--text-muted)'}}>Gerando análise com Claude...</div>}
            {(analysis as any)?.analysis&&<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:20,lineHeight:1.8,fontSize:13,color:'var(--text)',whiteSpace:'pre-wrap'}}>{(analysis as any).analysis}</div>}
            {!explaining&&!(analysis as any)?.analysis&&<div style={{padding:60,textAlign:'center',color:'var(--text-muted)'}}>{ticker?`Clique em Analisar ${ticker}`:'Selecione um ativo'}</div>}
          </>}
          {tab==='chat'&&<>
            {!isPro?<div style={{padding:32,textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>💎</div>
              <div style={{fontWeight:700,marginBottom:8}}>Chat disponível no Plano PRO</div>
              <Link href="/pricing" style={{display:'inline-block',padding:'10px 24px',background:'var(--accent)',color:'var(--bg)',borderRadius:8,fontWeight:700,textDecoration:'none'}}>Fazer Upgrade</Link>
            </div>:<div style={{display:'flex',flexDirection:'column',height:480}}>
              <div style={{flex:1,overflowY:'auto',marginBottom:12}}>
                {messages.length===0&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-muted)',gap:8}}>
                  <div style={{fontSize:32}}>💬</div>
                  <div style={{fontSize:13}}>{ticker?`Pergunte sobre ${ticker}`:'Pergunte sobre o mercado'}</div>
                </div>}
                {messages.map((m,i)=><ChatBubble key={i} role={m.role} content={m.content}/>)}
                {chatLoading&&<div style={{color:'var(--text-muted)',fontSize:13,padding:'8px 0'}}>IA digitando...</div>}
                <div ref={chatRef}/>
              </div>
              <div style={{display:'flex',gap:8,borderTop:'1px solid var(--border)',paddingTop:12}}>
                <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),chatMsg.trim()&&send(chatMsg).then(()=>setChatMsg('')))} placeholder={ticker?`Pergunte sobre ${ticker}...`:'Pergunte qualquer coisa...'} disabled={chatLoading} style={inp}/>
                <button onClick={()=>chatMsg.trim()&&send(chatMsg).then(()=>setChatMsg(''))} disabled={!chatMsg.trim()||chatLoading} style={{padding:'10px 18px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>Enviar</button>
              </div>
            </div>}
          </>}
        </div>
      </div>
    </div>
  </div>);}