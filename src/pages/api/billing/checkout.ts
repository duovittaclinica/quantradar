import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
import{prisma}from '../../../database/client';

const isSandbox=process.env.PAGBANK_ENV==='sandbox';
const PAGBANK_URL=isSandbox?'https://sandbox.api.pagseguro.com':'https://api.pagseguro.com';

const PLANS:Record<string,{name:string;amount:number}>={
  PRO:    {name:'QuantRadar PRO',    amount:9700},
  PREMIUM:{name:'QuantRadar PREMIUM',amount:19700},
};

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).json({error:'Não autenticado. Faça login primeiro.'});

  const{planName}=req.body;
  const plan=PLANS[String(planName||'').toUpperCase()];
  if(!plan)return res.status(400).json({error:'Plano inválido. Use PRO ou PREMIUM'});

  const token=process.env.PAGBANK_TOKEN;
  if(!token)return res.status(500).json({error:'PAGBANK_TOKEN não configurado'});

  try{
    const user=await prisma.user.findUnique({where:{id:session.user.id}});
    if(!user)return res.status(404).json({error:'Usuário não encontrado'});

    const baseUrl=process.env.NEXTAUTH_URL||'https://quantradar4.vercel.app';
    const referenceId='qr_'+planName.toUpperCase()+'_'+user.id+'_'+Date.now();

    const body={
      reference_id:referenceId,
      customer:{name:user.name||user.email.split('@')[0],email:user.email},
      items:[{reference_id:planName,name:plan.name,quantity:1,unit_amount:plan.amount}],
      payment_methods:[{type:'CREDIT_CARD'},{type:'DEBIT_CARD'},{type:'PIX'}],
      redirect_url:baseUrl+'/billing/sucesso?plan='+planName,
      notification_urls:[baseUrl+'/api/billing/webhook'],
      soft_descriptor:'QuantRadar',
    };

    console.log('PagBank request:',PAGBANK_URL+'/checkouts','sandbox:',isSandbox);

    const response=await fetch(PAGBANK_URL+'/checkouts',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+token,
        'x-api-version':'4.0',
        'Accept':'application/json',
      },
      body:JSON.stringify(body),
    });

    const text=await response.text();
    console.log('PagBank response:',response.status,text.slice(0,300));

    if(!response.ok){
      return res.status(502).json({error:'Erro PagBank '+response.status,details:text,sandbox:isSandbox});
    }

    const order=JSON.parse(text);
    const checkoutUrl=order.links?.find((l:any)=>l.rel==='PAY')?.href
      ||order.links?.find((l:any)=>l.rel==='CHECKOUT')?.href
      ||order.links?.[0]?.href;

    return res.json({orderId:order.id,referenceId,checkoutUrl,status:order.status,sandbox:isSandbox});
  }catch(e:any){
    console.error('Checkout error:',e.message);
    return res.status(500).json({error:e.message});
  }
}