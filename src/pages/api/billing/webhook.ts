import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../../../database/client';

export const config={api:{bodyParser:true}};

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  try{
    const event=req.body;
    console.log('[webhook] PagBank event:',JSON.stringify(event).slice(0,300));

    // PagBank pode mandar o evento no campo data ou direto
    const order=event?.data||event;
    const charges=order?.charges||[];
    const status=charges[0]?.status||order?.status||'';
    const ref=order?.reference_id||'';

    if((status==='PAID'||status==='AUTHORIZED')&&ref.startsWith('qr_')){
      // ref formato: qr_PRO_userId_timestamp ou qr_PREMIUM_userId_timestamp
      const parts=ref.split('_');
      if(parts.length>=3){
        const planName=parts[1].toUpperCase();
        const userId=parts.slice(2,-1).join('_'); // userId pode ter underscore
        if(['PRO','PREMIUM'].includes(planName)&&userId){
          const plan=await prisma.plan.findFirst({where:{name:planName}});
          if(plan){
            await prisma.user.update({
              where:{id:userId},
              data:{plan:planName,planId:plan.id},
            });
            console.log('[webhook] ✅ Upgraded user',userId,'to',planName);
          }
        }
      }
    }
    return res.status(200).json({received:true,status,ref});
  }catch(e:any){
    console.error('[webhook] error:',e.message);
    return res.status(200).json({received:true}); // sempre 200 para PagBank
  }
}