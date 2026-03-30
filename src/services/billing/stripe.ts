async function getStripe(){try{const Stripe=(await import('stripe')).default;const key=process.env.STRIPE_SECRET_KEY;if(!key)throw new Error('STRIPE_SECRET_KEY not set');return new Stripe(key,{apiVersion:'2024-06-20',typescript:true});}catch{return null;}}
export const STRIPE_PRICES={PRO_MONTHLY:process.env.STRIPE_PRICE_PRO_MONTHLY??'',PRO_YEARLY:process.env.STRIPE_PRICE_PRO_YEARLY??'',PREMIUM_MONTHLY:process.env.STRIPE_PRICE_PREMIUM_MONTHLY??'',PREMIUM_YEARLY:process.env.STRIPE_PRICE_PREMIUM_YEARLY??''} as const;
export async function createCheckoutSession(userId:string,userEmail:string,priceId:string,successUrl:string,cancelUrl:string){
  const stripe=await getStripe();if(!stripe)throw new Error('Stripe not configured');
  const session=await stripe.checkout.sessions.create({mode:'subscription',payment_method_types:['card'],customer_email:userEmail,line_items:[{price:priceId,quantity:1}],success_url:`${successUrl}?session_id={CHECKOUT_SESSION_ID}`,cancel_url:cancelUrl,metadata:{userId},subscription_data:{metadata:{userId},trial_period_days:7},allow_promotion_codes:true,locale:'pt-BR'});
  return{url:session.url!,sessionId:session.id};
}
export async function createPortalSession(customerId:string,returnUrl:string){
  const stripe=await getStripe();if(!stripe)throw new Error('Stripe not configured');
  const session=await stripe.billingPortal.sessions.create({customer:customerId,return_url:returnUrl});
  return session.url;
}
export async function handleStripeWebhook(rawBody:Buffer,signature:string){
  const stripe=await getStripe();if(!stripe)throw new Error('Stripe not configured');
  const webhookSecret=process.env.STRIPE_WEBHOOK_SECRET;if(!webhookSecret)throw new Error('STRIPE_WEBHOOK_SECRET not set');
  let event:any;
  try{event=stripe.webhooks.constructEvent(rawBody,signature,webhookSecret);}catch(err){throw new Error(`Webhook signature invalid: ${(err as Error).message}`);}
  const prismaUpdate=async(userId:string,planName:string,expiresAt?:Date)=>{const{default:prisma}=await import('../../database/client');const plan=await prisma.plan.findUnique({where:{name:planName}});if(!plan)return;await prisma.user.update({where:{id:userId},data:{planId:plan.id,role:planName as any,planExpiresAt:expiresAt??null}});};
  switch(event.type){
    case'checkout.session.completed':{const s=event.data.object;const uid=s.metadata?.userId;if(!uid)break;const sub=await stripe.subscriptions.retrieve(s.subscription as string);const pid=sub.items.data[0]?.price.id??'';const plan=pid.includes(STRIPE_PRICES.PRO_MONTHLY)||pid.includes(STRIPE_PRICES.PRO_YEARLY)?'PRO':'PREMIUM';await prismaUpdate(uid,plan,new Date(sub.current_period_end*1000));return{event:event.type,userId:uid,plan};}
    case'customer.subscription.deleted':{const sub=event.data.object;if(sub.metadata?.userId)await prismaUpdate(sub.metadata.userId,'FREE');return{event:event.type};}
    default:return{event:event.type};
  }
  return{event:event.type};
}