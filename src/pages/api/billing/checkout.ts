import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';
import{prisma}from '../../../database/client';

const PAGBANK_BASE=process.env.PAGBANK_ENV==='sandbox'
  ?'https://sandbox.api.pagseguro.com'
  :'https://api.pagseguro.com';

const PLANS={
  PRO:   {name:'QuantRadar PRO',   amount:9700,  desc:'Plano PRO mensal — 30 ativos, 50 alertas, 50 IA/dia'},
  PREMIUM:{name:'QuantRadar PREMIUM',amount:19700,desc:'Plano PREMIUM mensal — 100 ativos, alertas ilimitados, IA ilimitada'},
};

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).json({error:'Faça login para assinar um plano'});

  const{planName}=req.body;
  const plan=PLANS[(planName||'').toUpperCase() as keyof typeof PLANS];
  if(!plan)return res.status(400).json({error:'Plano inválido. Use PRO ou PREMIUM'});

  const token=process.env.PAGBANK_TOKEN;
  if(!token)return res.status(500).json({error:'Pagamento não configurado'});

  try{
    const user=await prisma.user.findUnique({where:{id:session.user.id}});
    if(!user)return res.status(404).json({error:'Usuário não encontrado'});

    const base=process.env.NEXTAUTH_URL||'https://quantradar4.vercel.app';
    const ref='qr_'+planName.toUpperCase()+'_'+user.id+'_'+Date.now();

    const body={
      reference_id: ref,
      customer:{
        name:user.name||user.email.split('@')[0],
        email:user.email,
      },
      items:[{
        reference_id:planName.toUpperCase(),
        name:plan.name,
        quantity:1,
        unit_amount:plan.amount,
      }],
      payment_methods:[{type:'CREDIT_CARD'},{type:'DEBIT_CARD'},{type:'PIX'}],
      redirect_url:base+'/billing/sucesso?plan='+planName,
      notification_urls:[base+'/api/billing/webhook'],
      soft_descriptor:'QuantRadar',
    };

    const resp=await fetch(PAGBANK_BASE+'/checkouts',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+token,
        'x-api-version':'4.0',
      },
      body:JSON.stringify(body),
    });

    const raw=await resp.text();
    if(!resp.ok){
      console.error('PagBank error',resp.status,raw);
      return res.status(502).json({error:'Erro PagBank: '+resp.status,details:raw.slice(0,300)});
    }

    const data=JSON.parse(raw);
    // PagBank checkout returns a links array; find PAY link
    const payLink=data.links?.find((l:any)=>l.rel==='PAY')?.href
      ||data.links?.find((l:any)=>l.rel==='CHECKOUT')?.href
      ||data.links?.[0]?.href;

    return res.json({orderId:data.id,referenceId:ref,checkoutUrl:payLink,status:data.status});
  }catch(e:any){
    console.error('Checkout error',e.message);
    return res.status(500).json({error:e.message});
  }
}