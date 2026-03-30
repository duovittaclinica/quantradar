import React,{useState,useEffect,type ReactNode,type CSSProperties}from 'react';

export function ScoreRing({score,size=52}:{score:number;size?:number}){
  const color=score>=80?'var(--green)':score>=65?'var(--yellow)':'var(--red)';
  const r=size/2-5;const circ=2*Math.PI*r;const dash=(score/100)*circ;
  return(<div style={{position:'relative',width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={4}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{filter:`drop-shadow(0 0 4px ${color}88)`,transition:'stroke-dasharray .6s ease'}}/>
    </svg>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{fontSize:size<48?12:15,fontWeight:800,color,lineHeight:1}}>{score}</span>
    </div>
  </div>);}

export function Badge({children,color='var(--accent)',size='sm'}:{children:ReactNode;color?:string;size?:'xs'|'sm'|'md';}){
  const pad=size==='xs'?'1px 6px':size==='md'?'4px 12px':'2px 8px';
  const fs=size==='xs'?10:size==='md'?13:11;
  return(<span style={{background:`${color}1A`,color,border:`1px solid ${color}44`,borderRadius:4,padding:pad,fontSize:fs,fontWeight:700,letterSpacing:'0.05em',whiteSpace:'nowrap',fontFamily:'var(--mono)'}}>{children}</span>);}

const TC:Record<string,string>={COMPRA_FORTE:'var(--green)',COMPRA_MODERADA:'var(--yellow)',AGUARDAR:'var(--text-muted)',ALTO_RISCO:'var(--red)',VENDA:'var(--red)'};
const TL:Record<string,string>={COMPRA_FORTE:'COMPRA FORTE',COMPRA_MODERADA:'COMPRA MODERADA',AGUARDAR:'AGUARDAR',ALTO_RISCO:'ALTO RISCO',VENDA:'VENDA'};
export function SignalTag({tag}:{tag:string}){return<Badge color={TC[tag]??'var(--text-muted)'}>{TL[tag]??tag}</Badge>;}

export function Card({children,style,onClick,hover=false}:{children:ReactNode;style?:CSSProperties;onClick?:()=>void;hover?:boolean;}){
  const[h,setH]=useState(false);
  return(<div onClick={onClick} onMouseEnter={()=>hover&&setH(true)} onMouseLeave={()=>hover&&setH(false)}
    style={{background:'var(--card)',border:`1px solid ${h?'var(--accent)55':'var(--border)'}`,borderRadius:'var(--radius)',padding:20,cursor:onClick?'pointer':'default',transition:'border-color .15s',transform:h&&hover?'translateY(-1px)':'none',...style}}>{children}</div>);}

export function Button({children,onClick,variant='primary',size='md',loading=false,disabled=false,fullWidth=false,type='button',style,...rest}:
  React.ButtonHTMLAttributes<HTMLButtonElement>&{loading?:boolean;fullWidth?:boolean;size?:'sm'|'md'|'lg';variant?:'primary'|'secondary'|'ghost'|'danger';}){
  const bg={primary:'var(--accent)',secondary:'transparent',ghost:'transparent',danger:'var(--red-dim)'}[variant];
  const col={primary:'#090B0F',secondary:'var(--accent)',ghost:'var(--text-muted)',danger:'var(--red)'}[variant];
  const brd={primary:'none',secondary:'1px solid var(--accent)44',ghost:'1px solid var(--border)',danger:'1px solid var(--red)44'}[variant];
  const pad={sm:'6px 12px',md:'9px 18px',lg:'12px 24px'}[size];
  const fs={sm:12,md:13,lg:15}[size];
  return(<button type={type} onClick={onClick} disabled={disabled||loading} {...rest}
    style={{background:(loading||disabled)?'var(--border)':bg,color:(loading||disabled)?'var(--text-muted)':col,border:brd,padding:pad,fontSize:fs,fontWeight:700,borderRadius:'var(--radius-sm)',cursor:(loading||disabled)?'not-allowed':'pointer',opacity:disabled?0.5:1,transition:'all .15s',fontFamily:'var(--font)',width:fullWidth?'100%':'auto',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,...style}}>
    {loading&&<span style={{width:12,height:12,border:'2px solid currentColor',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block'}}/>}
    {children}</button>);}

export function Input({label,error,style,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label?:string;error?:string;}){
  return(<div style={{display:'flex',flexDirection:'column',gap:4}}>
    {label&&<label style={{fontSize:12,color:'var(--text-muted)',fontWeight:500}}>{label}</label>}
    <input {...props} style={{padding:'9px 12px',fontSize:13,borderRadius:'var(--radius-sm)',background:'var(--surface)',border:`1px solid ${error?'var(--red)':'var(--border)'}`,color:'var(--text)',outline:'none',...style}}/>
    {error&&<span style={{fontSize:11,color:'var(--red)'}}>{error}</span>}
  </div>);}

export function Skeleton({width,height,style}:{width?:string|number;height?:number;style?:CSSProperties;}){
  return<div className="skeleton" style={{width:width??'100%',height:height??14,borderRadius:6,...style}}/>;}

export function Spinner({size=20,color='var(--accent)'}:{size?:number;color?:string;}){
  return<div style={{width:size,height:size,border:`2px solid ${color}33`,borderTopColor:color,borderRadius:'50%',animation:'spin .7s linear infinite',flexShrink:0}}/>;}

export function Empty({icon='📭',title,sub,action}:{icon?:string;title:string;sub?:string;action?:ReactNode;}){
  return(<div style={{textAlign:'center',padding:'48px 24px',color:'var(--text-muted)'}}>
    <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
    <div style={{fontSize:15,fontWeight:700,color:'var(--text)',marginBottom:6}}>{title}</div>
    {sub&&<div style={{fontSize:13,marginBottom:16}}>{sub}</div>}
    {action}
  </div>);}

export function ProgressBar({value,max=100,color='var(--accent)',height=4,label}:{value:number;max?:number;color?:string;height?:number;label?:string;}){
  const pct=Math.min(100,(value/max)*100);
  return(<div>
    {label&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,color:'var(--text-muted)'}}>{label}</span><span style={{fontSize:11,fontWeight:700,color}}>{value}</span></div>}
    <div style={{height,background:'var(--border)',borderRadius:99}}><div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:99,transition:'width .6s ease',boxShadow:`0 0 6px ${color}88`}}/></div>
  </div>);}

export function SentimentBadge({s}:{s?:string;}){
  const map:Record<string,string>={positivo:'var(--green)',negativo:'var(--red)',neutro:'var(--yellow)'};
  const lbl:Record<string,string>={positivo:'POS',negativo:'NEG',neutro:'NEU'};
  return<Badge color={map[s??'']??'var(--text-muted)'}>{lbl[s??'']??'—'}</Badge>;}

export function ChangeText({value,suffix='%',decimals=2}:{value:number;suffix?:string;decimals?:number;}){
  return<span style={{color:value>=0?'var(--green)':'var(--red)',fontWeight:600}}>{value>=0?'▲':'▼'} {Math.abs(value).toFixed(decimals)}{suffix}</span>;}

export function Chip({label,active,onClick}:{label:string;active?:boolean;onClick?:()=>void;}){
  return<button onClick={onClick} style={{background:active?'var(--accent)':'transparent',color:active?'var(--bg)':'var(--text-muted)',border:`1px solid ${active?'var(--accent)':'var(--border)'}`,borderRadius:6,padding:'5px 12px',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s',whiteSpace:'nowrap',fontFamily:'var(--font)'}}>{label}</button>;}

export function KpiCard({label,value,sub,color='var(--accent)',icon}:{label:string;value:string|number;sub?:string;color?:string;icon?:string;}){
  return(<Card style={{position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,right:0,width:80,height:80,background:`radial-gradient(circle at 100% 0%, ${color}18, transparent 70%)`}}/>
    {icon&&<div style={{fontSize:22,marginBottom:10}}>{icon}</div>}
    <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:6}}>{label}</div>
    <div style={{fontSize:32,fontWeight:900,color,letterSpacing:'-0.03em',lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:'var(--text-muted)',marginTop:6}}>{sub}</div>}
  </Card>);}

export function Stat({label,value,color,sub}:{label:string;value:ReactNode;color?:string;sub?:string;}){
  return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'10px 14px',minWidth:90}}>
    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:4}}>{label}</div>
    <div style={{fontSize:15,fontWeight:700,color:color??'var(--text)'}}>{value}</div>
    {sub&&<div style={{fontSize:10,color:'var(--text-dim)',marginTop:3}}>{sub}</div>}
  </div>);}

export function Tabs({tabs,active,onChange}:{tabs:Array<{id:string;label:string;badge?:number}>;active:string;onChange:(id:string)=>void;}){
  return(<div style={{display:'flex',borderBottom:'1px solid var(--border)'}}>
    {tabs.map(tab=>(<button key={tab.id} onClick={()=>onChange(tab.id)} style={{padding:'11px 18px',background:'transparent',border:'none',borderBottom:`2px solid ${active===tab.id?'var(--accent)':'transparent'}`,color:active===tab.id?'var(--accent)':'var(--text-muted)',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .15s',display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font)'}}>
      {tab.label}
      {tab.badge!==undefined&&<span style={{background:'var(--red)',color:'#fff',borderRadius:99,fontSize:10,fontWeight:800,padding:'1px 5px'}}>{tab.badge}</span>}
    </button>))}
  </div>);}

export function Toast({message,type='info',onClose}:{message:string;type?:'success'|'error'|'info'|'warning';onClose:()=>void;}){
  const colors={success:'var(--green)',error:'var(--red)',info:'var(--accent)',warning:'var(--yellow)'};
  const icons={success:'✓',error:'✕',info:'ℹ',warning:'⚠'};
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[onClose]);
  return(<div style={{position:'fixed',bottom:24,right:24,zIndex:9999,background:'var(--card)',border:`1px solid ${colors[type]}55`,borderLeft:`3px solid ${colors[type]}`,borderRadius:'var(--radius)',padding:'14px 18px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 8px 32px rgba(0,0,0,0.4)',animation:'fadeIn .2s ease',maxWidth:360}}>
    <span style={{color:colors[type],fontSize:16}}>{icons[type]}</span>
    <span style={{fontSize:13,color:'var(--text)',flex:1}}>{message}</span>
    <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:16,padding:'0 4px'}}>×</button>
  </div>);}