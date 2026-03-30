import type{NextApiRequest,NextApiResponse}from 'next';
import{getServerSession}from 'next-auth/next';
import{authOptions}from '../../../auth/config';

const APPMAX_API=process.env.APPMAX_API_URL||'https://sandbox.appmax.com.br/api/v3';
const APPMAX_KEY=process.env.APPMAX_API_KEY||'';

const PLAN_PRODUCTS:Record<string,{name:string;price:number;appmax_id?:string}> = {
  PRO:     {name:'QuantRadar PRO',    price:9700},  // R$97,00 em centavos
  PREMIUM: {name:'QuantRadar PREMIUM',price:19700}, // R$197,00 em centavos
};

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const session=await getServerSession(req,res,authOptions);
  if(!session)return res.status(401).json({error:'Unauthorized'});
  try{
    const{plan}=req.body;
    if(!PLAN_PRODUCTS[plan])return res.status(400).json({error:'Plano inválido'});
    if(!APPMAX_KEY)return res.status(500).json({error:'AppMax não configurado'});
    const product=PLAN_PRODUCTS[plan];
    // Create order in AppMax
    const orderRes=await fetch(APPMAX_API+'/order',{
      method:'POST',
      headers:{'Content-Type':'application/json','access-token':APPMAX_KEY},
      body:JSON.stringify({
        cart:{
          contents:[{name:product.name,qty:1,price:product.price}],
          total:product.price,
        },
        customer:{
          email:session.user.email,
          name:session.user.name||session.user.email,
        },
        postback_url:process.env.NEXTAUTH_URL+'/api/billing/webhook',
        metadata:{userId:session.user.id,plan},
      })
    });
    const order=await orderRes.json();
    if(!orderRes.ok)return res.status(400).json({error:'Erro AppMax',detail:order});
    // Get checkout link
    const checkoutRes=await fetch(APPMAX_API+'/payment-link',{
      method:'POST',
      headers:{'Content-Type':'application/json','access-token':APPMAX_KEY},
      body:JSON.stringify({order_id:order.data?.id||order.id,payment_method:'pix,credit_card'})
    });
    const checkout=await checkoutRes.json();
    const url=checkout.data?.url||checkout.url||checkout.payment_url;
    return res.json({url,orderId:order.data?.id||order.id,plan,price:product.price});
  }catch(e:any){return res.status(500).json({error:e.message});}
}