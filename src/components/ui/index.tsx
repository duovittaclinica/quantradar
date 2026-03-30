/**
 * QuantRadar UI Primitives
 * ScoreRing, Badge, SignalTag, Card, Button, Input, Skeleton, Spinner,
 * Empty, ProgressBar, SentimentBadge, ChangeText, Chip, KpiCard, Stat,
 * Tabs, Toast, Select, Modal
 */
import React,{useState,useEffect,useRef,ReactNode}from 'react';

// ─── ScoreRing ────────────────────────────────────────────────
export function ScoreRing({score,size=52}:{score:number;size?:number}){
  const r=size/2-4;const circ=2*Math.PI*r;
  const pct=Math.max(0,Math.min(100,score));
  const dash=circ*(pct/100);
  const color=pct>=75?'var(--green)':pct>=55?'var(--yellow)':'var(--red)';
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={3}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
      strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ/4}
      strokeLinecap="round" style={{transition:'stroke-dasharray .4s ease'}}/>
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
      fill={color} fontSize={size*0.28} fontWeight={800} fontFamily="var(--mono)">{pct}</text>
  </svg>);}

// ─── Badge ────────────────────────────────────────────────────
export function Badge({children,color='var(--accent)',size='sm',style:s}:{children:ReactNode;color?:string;size?:'xs'|'sm'|'md';style?:React.CSSProperties}){
  const pad=size==='xs'?'2px 6px':size==='sm'?'3px 8px':'4px 10px';
  const fs=size==='xs'?9:size==='sm'?10:12;
  return(<span style={{display:'inline-flex',alignItems:'center',padding:pad,borderRadius:99,background:color+'22',color,fontSize:fs,fontWeight:700,whiteSpace:'nowrap' as const,...s}}>{children}</span>);}

// ─── SignalTag ────────────────────────────────────────────────
const TAG_MAP:Record<string,{bg:string;color:string;label:string}>={
  COMPRA_FORTE:{bg:'var(--green-dim)',color:'var(--green)',label:'🟢 COMPRA FORTE'},
  COMPRA_MODERADA:{bg:'rgba(0,212,255,.12)',color:'var(--accent)',label:'🔵 COMPRA MOD.'},
  AGUARDAR:{bg:'var(--yellow-dim)',color:'var(--yellow)',label:'🟡 AGUARDAR'},
  ALTO_RISCO:{bg:'var(--red-dim)',color:'var(--red)',label:'🔴 ALTO RISCO'},
  VENDA:{bg:'rgba(255,61,87,.15)',color:'var(--red)',label:'🔻 VENDA'},
};
export function SignalTag({tag}:{tag:string}){
  const cfg=TAG_MAP[tag]??TAG_MAP.AGUARDAR;
  return(<span style={{display:'inline-flex',alignItems:'center',padding:'4px 10px',borderRadius:8,background:cfg.bg,color:cfg.color,fontSize:11,fontWeight:700,whiteSpace:'nowrap' as const}}>{cfg.label}</span>);}

// ─── Card ─────────────────────────────────────────────────────
export function Card({children,style,className,onClick,hover=false}:{children:ReactNode;style?:React.CSSProperties;className?:string;onClick?:()=>void;hover?:boolean}){
  return(<div className={className} onClick={onClick} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:20,transition:hover?'border-color .15s':'',cursor:onClick?'pointer':'default',...style}}
    onMouseEnter={hover&&!onClick?undefined:onClick?(e:any)=>{e.currentTarget.style.borderColor='var(--accent)44';}:undefined}
    onMouseLeave={hover&&!onClick?undefined:onClick?(e:any)=>{e.currentTarget.style.borderColor='var(--border)';}:undefined}>
    {children}
  </div>);}

// ─── Button ───────────────────────────────────────────────────
export function Button({children,onClick,variant='primary',size='md',disabled,loading,fullWidth,type='button',style:s}:{children:ReactNode;onClick?:()=>void;variant?:'primary'|'secondary'|'ghost'|'danger';size?:'sm'|'md'|'lg';disabled?:boolean;loading?:boolean;fullWidth?:boolean;type?:'button'|'submit';style?:React.CSSProperties}){
  const bg={primary:'var(--accent)',secondary:'var(--surface)',ghost:'transparent',danger:'var(--red-dim)'}[variant];
  const color={primary:'var(--bg)',secondary:'var(--text)',ghost:'var(--accent)',danger:'var(--red)'}[variant];
  const border={primary:'none',secondary:'1px solid var(--border)',ghost:'1px solid var(--accent)44',danger:'1px solid var(--red)44'}[variant];
  const pad={sm:'6px 12px',md:'9px 18px',lg:'12px 24px'}[size];
  const fs={sm:12,md:13,lg:15}[size];
  return(<button type={type} onClick={onClick} disabled={disabled||loading} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,padding:pad,background:disabled||loading?'var(--surface)':bg,color:disabled||loading?'var(--text-muted)':color,border:disabled||loading?'1px solid var(--border)':border,borderRadius:8,fontSize:fs,fontWeight:700,cursor:disabled||loading?'not-allowed':'pointer',width:fullWidth?'100%':'auto',transition:'opacity .15s',...s}}>
    {loading&&<Spinner size={fs}/>}{children}
  </button>);}

// ─── Input ────────────────────────────────────────────────────
export function Input({value,onChange,placeholder,type='text',disabled,label,error,style:s}:{value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;disabled?:boolean;label?:string;error?:string;style?:React.CSSProperties}){
  return(<div style={{display:'flex',flexDirection:'column',gap:4}}>
    {label&&<label style={{fontSize:11,color:'var(--text-muted)',fontWeight:600}}>{label}</label>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
      style={{padding:'9px 12px',background:'var(--surface)',border:`1px solid ${error?'var(--red)':'var(--border)'}`,borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',width:'100%',boxSizing:'border-box' as const,...s}}/>
    {error&&<span style={{fontSize:11,color:'var(--red)'}}>{error}</span>}
  </div>);}

// ─── Skeleton ─────────────────────────────────────────────────
export function Skeleton({width,height=16,radius=6}:{width?:string|number;height?:number;radius?:number}){
  return(<div style={{width:width??'100%',height,borderRadius:radius,background:'var(--skeleton,var(--surface))',animation:'pulse 1.5s ease-in-out infinite'}}/>);}

// ─── Spinner ──────────────────────────────────────────────────
export function Spinner({size=20,color='var(--accent)'}:{size?:number;color?:string}){
  return(<svg width={size} height={size} viewBox="0 0 24 24" style={{animation:'spin 0.8s linear infinite',flexShrink:0}}>
    <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
  </svg>);}

// ─── Empty ────────────────────────────────────────────────────
export function Empty({icon='📭',title,sub}:{icon?:string;title:string;sub?:string}){
  return(<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',gap:10,textAlign:'center'}}>
    <span style={{fontSize:36}}>{icon}</span>
    <div style={{fontSize:15,fontWeight:700,color:'var(--text)'}}>{title}</div>
    {sub&&<div style={{fontSize:12,color:'var(--text-muted)',maxWidth:320}}>{sub}</div>}
  </div>);}

// ─── ProgressBar ──────────────────────────────────────────────
export function ProgressBar({label,value,color='var(--accent)',height=6,showValue=true}:{label?:string;value:number;color?:string;height?:number;showValue?:boolean}){
  return(<div>
    {(label||showValue)&&<div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
      {label&&<span style={{color:'var(--text-muted)'}}>{label}</span>}
      {showValue&&<span style={{color,fontWeight:700}}>{value}</span>}
    </div>}
    <div style={{height,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
      <div style={{width:`${Math.max(0,Math.min(100,value))}%`,height:'100%',background:color,borderRadius:99,transition:'width .4s ease'}}/>
    </div>
  </div>);}

// ─── SentimentBadge ───────────────────────────────────────────
export function SentimentBadge({s}:{s:string}){
  const map:Record<string,{c:string;label:string}>={positivo:{c:'var(--green)',label:'↑'},negativo:{c:'var(--red)',label:'↓'},neutro:{c:'var(--yellow)',label:'→'}};
  const cfg=map[s]??map.neutro;
  return(<span style={{width:16,height:16,borderRadius:'50%',background:cfg.c+'22',color:cfg.c,fontSize:10,fontWeight:900,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{cfg.label}</span>);}

// ─── ChangeText ───────────────────────────────────────────────
export function ChangeText({value,showIcon=true}:{value:number;showIcon?:boolean}){
  const pos=value>=0;
  return(<span style={{fontSize:13,fontWeight:700,color:pos?'var(--green)':'var(--red)'}}>
    {showIcon&&(pos?'▲ ':'▼ ')}{pos?'+':''}{value.toFixed(2)}%
  </span>);}

// ─── Chip ─────────────────────────────────────────────────────
export function Chip({label,active,onClick}:{label:string;active?:boolean;onClick?:()=>void}){
  return(<button onClick={onClick} style={{padding:'5px 12px',borderRadius:20,background:active?'var(--accent)':'var(--surface)',color:active?'var(--bg)':'var(--text-muted)',border:`1px solid ${active?'var(--accent)':'var(--border)'}`,fontSize:11,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>{label}</button>);}

// ─── KpiCard ──────────────────────────────────────────────────
export function KpiCard({label,value,sub,color='var(--text)',icon}:{label:string;value:string|number;sub?:string;color?:string;icon?:string}){
  return(<div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px'}}>
    {icon&&<div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><span style={{fontSize:18}}>{icon}</span><span style={{fontSize:11,color:'var(--text-muted)'}}>{label}</span></div>}
    {!icon&&<div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>{label}</div>}
    <div style={{fontSize:26,fontWeight:900,color,letterSpacing:'-0.03em'}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:'var(--text-muted)',marginTop:4}}>{sub}</div>}
  </div>);}

// ─── Stat ─────────────────────────────────────────────────────
export function Stat({label,value,color='var(--text-muted)'}:{label:string;value:string|number;color?:string}){
  return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:6,padding:'4px 8px',textAlign:'center'}}>
    <div style={{fontSize:9,color:'var(--text-dim)',marginBottom:2}}>{label}</div>
    <div style={{fontSize:12,fontWeight:700,color,fontFamily:'var(--mono)'}}>{value}</div>
  </div>);}

// ─── Tabs ─────────────────────────────────────────────────────
export function Tabs({tabs,active,onChange}:{tabs:{id:string;label:string}[];active:string;onChange:(id:string)=>void}){
  return(<div style={{display:'flex',gap:0,background:'var(--card)',border:'1px solid var(--border)',borderRadius:'12px 12px 0 0',overflow:'hidden'}}>
    {tabs.map(t=>(<button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:'11px 16px',fontSize:13,fontWeight:600,cursor:'pointer',background:active===t.id?'var(--accent-dim)':'transparent',color:active===t.id?'var(--accent)':'var(--text-muted)',border:'none',borderBottom:`2px solid ${active===t.id?'var(--accent)':'transparent'}`,transition:'all .15s'}}>{t.label}</button>))}
  </div>);}

// ─── Toast ────────────────────────────────────────────────────
export function Toast({message,type='info',onClose}:{message:string;type?:'info'|'success'|'error'|'warning';onClose:()=>void}){
  const colors={info:'var(--accent)',success:'var(--green)',error:'var(--red)',warning:'var(--yellow)'};
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[]);
  return(<div style={{position:'fixed',bottom:24,right:24,padding:'12px 18px',background:'var(--card)',border:`1px solid ${colors[type]}44`,borderLeft:`4px solid ${colors[type]}`,borderRadius:10,display:'flex',alignItems:'center',gap:12,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,.4)',maxWidth:360}}>
    <span style={{fontSize:13,color:'var(--text)',flex:1}}>{message}</span>
    <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:16,lineHeight:1}}>×</button>
  </div>);}

// ─── Select ───────────────────────────────────────────────────
export function Select({value,onChange,options,label,style:s}:{value:string;onChange:(v:string)=>void;options:{value:string;label:string}[];label?:string;style?:React.CSSProperties}){
  return(<div style={{display:'flex',flexDirection:'column',gap:4}}>
    {label&&<label style={{fontSize:11,color:'var(--text-muted)',fontWeight:600}}>{label}</label>}
    <select value={value} onChange={e=>onChange(e.target.value)} style={{padding:'9px 12px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',cursor:'pointer',...s}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>);}