import type{NextApiRequest,NextApiResponse}from 'next';
import{withAuth}from '../../middleware/auth';
import{rateLimit}from '../../middleware/ratelimit';
import prisma from '../../database/client';
import{ok,created,badRequest,notFound,serverError,methodNotAllowed}from '../../lib/response';
const LIMITS:Record<string,number>={FREE:5,PRO:50,PREMIUM:500};
export const alertsHandler=withAuth(async(req,res,userId,plan)=>{
  const allowed=await rateLimit(req,res,userId,plan);if(!allowed)return;
  if(req.method==='GET'){try{const alerts=await prisma.alert.findMany({where:{userId},include:{asset:{select:{ticker:true,name:true}}},orderBy:{createdAt:'desc'}});const unread=alerts.filter(a=>a.triggered&&!a.active).length;return ok(res,{alerts,unread},{total:alerts.length});}catch(err){return serverError(res,err);}}
  if(req.method==='POST'){try{const maxAlerts=LIMITS[plan]??5;const current=await prisma.alert.count({where:{userId,active:true}});if(current>=maxAlerts)return badRequest(res,`Plano ${plan} permite ${maxAlerts} alertas ativos.`);const{type,ticker,condition,message,channels=['panel']}=req.body as{type:string;ticker?:string;condition:Record<string,unknown>;message?:string;channels?:string[]};if(!condition)return badRequest(res,'condition é obrigatório');const asset=ticker?await prisma.asset.findUnique({where:{ticker:ticker.toUpperCase()}}):null;const alert=await prisma.alert.create({data:{userId,assetId:asset?.id,type:type as any,condition:condition as any,message,channels}});return created(res,alert);}catch(err){return serverError(res,err);}}
  return methodNotAllowed(res,['GET','POST']);
});
export const alertItemHandler=withAuth(async(req,res,userId)=>{
  const alertId=req.query.id as string;
  const alert=await prisma.alert.findFirst({where:{id:alertId,userId}});if(!alert)return notFound(res,'Alerta');
  if(req.method==='PATCH'){try{const{active}=req.body as{active?:boolean};const updated=await prisma.alert.update({where:{id:alertId},data:{active:active??!alert.active}});return ok(res,updated);}catch(err){return serverError(res,err);}}
  if(req.method==='DELETE'){try{await prisma.alert.delete({where:{id:alertId}});return ok(res,{deleted:true});}catch(err){return serverError(res,err);}}
  return methodNotAllowed(res,['PATCH','DELETE']);
});