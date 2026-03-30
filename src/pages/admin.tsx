import React,{useState}from 'react';
import{useSession}from 'next-auth/react';
import{useAdminStats,useAdminConfig}from '../hooks/useMarket';
import{useApiMutation}from '../hooks/useApi';
function StatBox({label,value,color='var(--text)'}:{label:string;value:string|number;color?:string}){
  return(<div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'16px 18px',textAlign:'center'}}>
    <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:6}}>{label}</div>
    <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
  </div>);}
export default function AdminPage(){
  const{data:session}=useSession();
  const{data:stats,loading:sLoad,refetch:sRefetch}=useAdminStats();
  const seedPlans=useApiMutation('/api/admin/seed','POST');
  const runJob=useApiMutation('/api/admin/jobs','POST');
  const[seeded,setSeeded]=useState(false);
  const[jobMsg,setJobMsg]=useState('');
  if(!session||session.user.role!=='ADMIN')return<div style={{padding:48,textAlign:'center',color:'var(--red)'}}>Acesso negado — apenas administradores</div>;
  const s=stats as any;
  const handleSeed=async()=>{await seedPlans.mutate({});setSeeded(true);setTimeout(()=>setSeeded(false),3000);};
  const handleJob=async(job:string)=>{const r=await runJob.mutate({job}) as any;setJobMsg(r?.message||r?.status||'OK');setTimeout(()=>setJobMsg(''),5000);};
  return(<div style={{padding:24}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
      <h1 style={{fontSize:22,fontWeight:900,color:'var(--text)'}}>⚙️ Admin Panel</h1>
      <button onClick={()=>sRefetch()} style={{padding:'8px 16px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text-muted)',fontSize:13,cursor:'pointer'}}>↻ Refresh</button>
    </div>
    {/* Stats */}
    {sLoad?<div style={{color:'var(--text-muted)',fontSize:13,marginBottom:20}}>Carregando...</div>:s&&<>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        <StatBox label="Usuários" value={s.userCount??0}/>
        <StatBox label="Sinais Gerados" value={s.signalCount??0}/>
        <StatBox label="Alertas Ativos" value={s.alertCount??0} color="var(--yellow)"/>
        <StatBox label="Jobs Recentes" value={s.jobLogs?.length??0}/>
      </div>
      {/* Job logs */}
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20,marginBottom:20}}>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>Jobs Recentes</div>
        <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
          <thead><tr style={{borderBottom:'1px solid var(--border)'}}>
            {['Job','Status','Duração','Items','Data'].map(h=><th key={h} style={{padding:'8px 10px',textAlign:'left',color:'var(--text-muted)',fontWeight:600}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(s.jobLogs??[]).slice(0,15).map((log:any,i:number)=>(
              <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={{padding:'8px 10px',fontFamily:'var(--mono)',fontSize:11}}>{log.jobName}</td>
                <td style={{padding:'8px 10px'}}><span style={{padding:'2px 8px',borderRadius:99,background:log.status==='success'?'var(--green-dim)':'var(--red-dim)',color:log.status==='success'?'var(--green)':'var(--red)',fontSize:11,fontWeight:700}}>{log.status}</span></td>
                <td style={{padding:'8px 10px',color:'var(--text-muted)',fontFamily:'var(--mono)'}}>{log.duration}ms</td>
                <td style={{padding:'8px 10px',color:'var(--text-muted)'}}>{log.itemCount??'-'}</td>
                <td style={{padding:'8px 10px',color:'var(--text-muted)',fontSize:11}}>{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>}
    {/* Actions */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>🌱 Setup do Banco</div>
        <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:14}}>Cria os planos FREE, PRO e PREMIUM no banco de dados.</p>
        <button onClick={handleSeed} disabled={seedPlans.loading} style={{padding:'10px 20px',background:'var(--accent)',color:'var(--bg)',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>{seedPlans.loading?'Seedando...':'Seed Planos'}</button>
        {seeded&&<span style={{marginLeft:12,color:'var(--green)',fontSize:13}}>✓ Feito!</span>}
      </div>
      <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:16,padding:20}}>
        <div style={{fontSize:14,fontWeight:700,color:'var(--text)',marginBottom:14}}>⚡ Jobs Manuais</div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={()=>handleJob('radar-update')} disabled={runJob.loading} style={{padding:'8px 16px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)',fontSize:12,fontWeight:600,cursor:'pointer'}}>Atualizar Radar</button>
        </div>
        {jobMsg&&<div style={{marginTop:10,padding:'8px 12px',background:'var(--green-dim)',border:'1px solid var(--green)44',borderRadius:8,color:'var(--green)',fontSize:12}}>{jobMsg}</div>}
        {runJob.error&&<div style={{marginTop:10,color:'var(--red)',fontSize:12}}>{runJob.error}</div>}
      </div>
    </div>
  </div>);}