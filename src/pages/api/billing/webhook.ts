import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../../../database/client';

export const config={api:{bodyParser:true}};

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();

  try{
    const event=req.body;
    console.log('PagBank webhook:',JSON.stringify(event).slice(0,200));

    // PagBank sends order updates
    const order=event?.data||event;
    const status=order?.charges?.[0]?.status||order?.status;
    const referenceId=order?.reference_id||'';

    // Only process paid orders: reference format qr_PRO_userId_timestamp or qr_PREMIUM_userId_timestamp
    if(status==='PAID'||status==='AUTHORIZED'){
      const parts=referenceId.split('_');
      // parts: ['qr','PRO' or 'PREMIUM','userId','timestamp']
      if(parts.length>=3&&parts[0]==='qr'){
        const planName=parts[1].toUpperCase();
        const userId=parts[2];

        if(['PRO','PREMIUM'].includes(planName)&&userId){
          const plan=await prisma.plan.findFirst({where:{name:planName}});
          if(plan){
            await prisma.user.update({
              where:{id:userId},
              data:{plan:planName,planId:plan.id},
            });
            console.log(`✅ User ${userId} upgraded to ${planName}`);
          }
        }
      }
    }

    return res.status(200).json({received:true});
  }catch(e:any){
    console.error('Webhook error:',e.message);
    return res.status(200).json({received:true}); // Always 200 to PagBank
  }
}