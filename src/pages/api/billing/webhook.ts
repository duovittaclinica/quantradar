import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../../../database/client';
import crypto from 'crypto';
export const config={api:{bodyParser:false}};
async function getRawBody(req:NextApiRequest):Promise<string>{
  return new Promise((resolve,reject)=>{
    let body='';
    req.on('data',(c:any)=>{body+=c.toString();});
    req.on('end',()=>resolve(body));
    req.on('error',reject);
  });
}
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  try{
    const raw=await getRawBody(req);
    const payload=JSON.parse(raw);
    // Verify AppMax signature if secret configured
    const sig=req.headers['x-appmax-signature']||req.headers['x-webhook-signature'];
    const secret=process.env.APPMAX_SECRET;
    if(secret&&sig){
      const expected=crypto.createHmac('sha256',secret).update(raw).digest('hex');
      if(sig!==expected){return res.status(401).json({error:'Invalid signature'});}
    }
    // Handle payment confirmation events
    const event=payload.event||payload.type||payload.status;
    const isApproved=['approved','paid','captured','completed'].includes(String(event).toLowerCase())
      ||(payload.payment?.status==='approved')
      ||(payload.order?.status==='approved');
    if(isApproved){
      const meta=payload.metadata||payload.order?.metadata||payload.data?.metadata||{};
      const{userId,plan}=meta;
      if(userId&&plan&&['PRO','PREMIUM'].includes(plan)){
        const planRecord=await prisma.plan.findFirst({where:{name:plan}});
        await prisma.user.update({
          where:{id:userId},
          data:{plan,planId:planRecord?.id??null}
        });
        // Log the upgrade
        await prisma.jobLog.create({
          data:{jobName:'appmax-webhook',status:'success',durationMs:0,
            itemCount:1,error:null}
        });
        console.log('[AppMax] User '+userId+' upgraded to '+plan);
      }
    }
    return res.json({received:true,event});
  }catch(e:any){
    console.error('[AppMax webhook error]',e.message);
    return res.status(500).json({error:e.message});
  }
}