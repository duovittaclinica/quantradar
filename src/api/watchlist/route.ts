import type{NextApiRequest,NextApiResponse}from 'next';
import{withAuth}from '../../middleware/auth';
import{rateLimit}from '../../middleware/ratelimit';
import prisma from '../../database/client';
import{ok,created,badRequest,notFound,serverError,methodNotAllowed}from '../../lib/response';
const WL:Record<string,number>={FREE:1,PRO:10,PREMIUM:50};
const IL:Record<string,number>={FREE:10,PRO:50,PREMIUM:500};
export const watchlistHandler=withAuth(async(req,res,userId,plan)=>{
  const allowed=await rateLimit(req,res,userId,plan);if(!allowed)return;
  try{
    if(req.method==='GET'){const w=await prisma.watchlist.findMany({where:{userId},include:{items:{include:{asset:true},orderBy:{addedAt:'desc'}}},orderBy:{createdAt:'desc'}});return ok(res,w);}
    if(req.method==='POST'){const{name='Minha Watchlist'}=req.body as{name?:string};const max=WL[plan]??1;const ex=await prisma.watchlist.count({where:{userId}});if(ex>=max)return badRequest(res,`Plano ${plan} permite ${max} watchlists.`);const wl=await prisma.watchlist.create({data:{userId,name},include:{items:true}});return created(res,wl);}
    return methodNotAllowed(res,['GET','POST']);
  }catch(err){return serverError(res,err);}
});
export const watchlistItemHandler=withAuth(async(req,res,userId,plan)=>{
  const allowed=await rateLimit(req,res,userId,plan);if(!allowed)return;
  const watchlistId=req.query.id as string;
  try{
    const wl=await prisma.watchlist.findFirst({where:{id:watchlistId,userId}});if(!wl)return notFound(res,'Watchlist');
    if(req.method==='POST'){const{ticker,notes,targetPrice}=req.body as{ticker:string;notes?:string;targetPrice?:number};if(!ticker)return badRequest(res,'ticker obrigatório');const max=IL[plan]??10;const cnt=await prisma.watchlistItem.count({where:{watchlistId}});if(cnt>=max)return badRequest(res,`Plano ${plan} permite ${max} ativos.`);const t=ticker.toUpperCase();const asset=await prisma.asset.findUnique({where:{ticker:t}});if(!asset)return notFound(res,`Ativo ${t}`);const item=await prisma.watchlistItem.upsert({where:{watchlistId_assetId:{watchlistId,assetId:asset.id}},create:{watchlistId,assetId:asset.id,notes,targetPrice},update:{notes,targetPrice}});return created(res,item);}
    if(req.method==='DELETE'){const assetId=req.query.assetId as string;if(!assetId)return badRequest(res,'assetId obrigatório');await prisma.watchlistItem.deleteMany({where:{watchlistId,assetId}});return ok(res,{deleted:true});}
    return methodNotAllowed(res,['POST','DELETE']);
  }catch(err){return serverError(res,err);}
});