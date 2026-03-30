import React,{useState}from 'react';
import{useAlerts,useCreateAlert}from '../hooks/useMarket';
const ALERT_TYPES=[
  {v:'SCORE_THRESHOLD',l:'Score Mínimo',d:'Notifica quando score atingir o valor'},
  {v:'PRICE_TARGET',l:'Preço Alvo',d:'Notifica quando preço atingir o alvo'},
  {v:'PRICE_DROP',l:'Queda de Preço',d:'Notifica em quedas bruscas'},
  {v:'VOLUME_SPIKE',l:'Volume Anômalo',d:'Notifica volume acima do normal'},
];
const IMPACT_COLOR:Record<string,string>={alto:'var(--red)',médio:'var(--yellow)',baixo:'var(--green)'};
export default function AlertsPage(){
  const{data:alertData,loading,error,refetch}=useAlerts();
  const createAlert=useCreateAlert();
  const[form,setForm]=useState({ticker:'',type:'SCORE_THRESHOLD',value:75,channels:['panel']});
  const[creating,setCreating]=useState(false);
  const[showForm,setShowForm]=useState(false);
  const alerts=(alertData as any)?.alerts??[];
  const unread=(alertData as any)?.unread??0;
  const handleCreate=async()=>{
    setCreating(true);
    try{
      await createAlert.mutate({type:form.type,ticker:form.ticker||undefined,condition:{field:form.type==='SCORE_THRESHOLD'?'score':form.type==='PRICE_TARGET'?'price':'changePercent',operator:'gte',value:form.value},channels:form.channels});
      setShowForm(false);refetch();
    }finally{setCreating(false);}
  };
  const inp={width:'100%',padding:'8px 12px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:13,outline:'none',boxSizing:'border-box' as const};
  return(<div style={{padding:24}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)'}}>🔔 Alertas</h1>
        {unread>0&&<div style={{background:'var(--red)',color:'white',borderRadius:99,padding:'2px 8px',fontSize:11,fontWeight:700}}>{unread} novos</div>}
      </div>
      <button onClick={()=>setShowForm(!showForm)} style={{padding:'8px 16px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>+ Novo Alerta</button>
    </div>
    {/* Create form */}
    {showForm&&(<div style={{background:'var(--card)',border:'1px solid var(--accent)44',borderRadius:16,padding:20,marginBottom:20}}>
      <h3 style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:16}}>Criar Alerta</h3>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
        <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Ticker (opcional)</label><input value={form.ticker} onChange={e=>setForm({...form,ticker:e.target.value.toUpperCase()})} placeholder="Ex: PETR4" style={inp}/></div>
        <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Tipo</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{...inp,cursor:'pointer'}}>{ALERT_TYPES.map(t=><option key={t.v} value={t.v}>{t.l}</option>)}</select></div>
        <div><label style={{fontSize:11,color:'var(--text-muted)',display:'block',marginBottom:4}}>Valor de disparo</label><input type="number" value={form.value} onChange={e=>setForm({...form,value:Number(e.target.value)})} style={inp}/></div>
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={handleCreate} disabled={creating} style={{padding:'8px 20px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>{creating?'Criando...':'Criar Alerta'}</button>
        <button onClick={()=>setShowForm(false)} style={{padding:'8px 20px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',fontSize:13,cursor:'pointer'}}>Cancelar</button>
      </div>
    </div>)}
    {/* List */}
    {loading&&<div style={{color:'var(--text-muted)',fontSize:13}}>Carregando alertas...</div>}
    {error&&<div style={{color:'var(--red)',fontSize:13}}>{error}</div>}
    {!loading&&!error&&(alerts.length===0?
      <div style={{textAlign:'center',padding:'60px 0',color:'var(--text-muted)'}}>
        <div style={{fontSize:32,marginBottom:12}}>🔔</div>
        <div style={{fontSize:14,fontWeight:600}}>Nenhum alerta configurado</div>
        <div style={{fontSize:12,marginTop:4}}>Crie alertas para ser notificado sobre movimentos importantes</div>
      </div>:
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {alerts.map((a:any)=>(<div key={a.id} style={{background:'var(--card)',border:`1px solid ${a.triggered?'var(--green)44':'var(--border)'}`,borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:36,height:36,borderRadius:8,background:a.triggered?'var(--green-dim)':a.active?'var(--accent-dim)':'var(--surface)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{a.triggered?'✅':a.active?'🔔':'🔕'}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{a.asset?.ticker??'Global'} — {ALERT_TYPES.find(t=>t.v===a.type)?.l??a.type}</div>
            <div style={{fontSize:11,color:'var(--text-muted)',marginTop:2}}>{a.message||JSON.stringify(a.condition)}</div>
          </div>
          <div style={{fontSize:10,color:a.triggered?'var(--green)':a.active?'var(--accent)':'var(--text-muted)',fontWeight:700}}>{a.triggered?'DISPARADO':a.active?'ATIVO':'INATIVO'}</div>
        </div>))}
      </div>
    )}
  </div>);}