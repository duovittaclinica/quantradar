import type{NextApiRequest,NextApiResponse}from 'next';
import{withAuth,withOptionalAuth}from '../../middleware/auth';
import{rateLimit}from '../../middleware/ratelimit';
import{getEnrichedAsset}from '../../services/market-data';
import{getAssetNews}from '../../services/news/newsapi';
import{getTickerSentimentScore,enrichNewsWithSentiment}from '../../services/sentiment/analyzer';
import{calculateScore}from '../../services/scoring/engine';
import prisma from '../../database/client';
import{ok,badRequest,notFound,serverError,methodNotAllowed,created}from '../../lib/response';
import type{InvestorProfile}from '../../types';
export const signalsListHandler=withOptionalAuth(async(req,res,userId,plan='FREE')=>{
  if(req.method!=='GET')return methodNotAllowed(res,['GET']);
  const allowed=await rateLimit(req,res,userId,plan);if(!allowed)return;
  try{const limit=Math.min(Number(req.query.limit??20),50);const signals=await prisma.signal.findMany({take:limit,orderBy:{generatedAt:'desc'},include:{asset:{select:{ticker:true,name:true,type:true,sector:true}}}});return ok(res,signals,{total:signals.length});}
  catch(err){return serverError(res,err);}
});
export const generateSignalHandler=withAuth(async(req,res,userId,plan)=>{
  if(req.method!=='POST')return methodNotAllowed(res,['POST']);
  const allowed=await rateLimit(req,res,userId,plan);if(!allowed)return;
  try{
    const{ticker,profile='MODERADO'}=req.body as{ticker:string;profile?:InvestorProfile};
    if(!ticker)return badRequest(res,'ticker obrigatório');
    const tickerUpper=ticker.toUpperCase();
    const asset=await getEnrichedAsset(tickerUpper);if(!asset)return notFound(res,`Ativo ${tickerUpper}`);
    const rawNews=await getAssetNews(tickerUpper,10);
    const enrichedNews=await enrichNewsWithSentiment(rawNews);
    const{score:sentimentScore}=await getTickerSentimentScore(enrichedNews);
    const result=calculateScore(asset,sentimentScore,profile as InvestorProfile);
    const dbAsset=await prisma.asset.upsert({where:{ticker:tickerUpper},create:{ticker:tickerUpper,name:asset.name,type:asset.type as any,sector:asset.sector},update:{updatedAt:new Date()}});
    const signal=await prisma.signal.create({data:{assetId:dbAsset.id,score:result.score,tag:result.tag,technicalScore:result.breakdown.technical,fundamentalScore:result.breakdown.fundamental,sentimentScore:result.breakdown.sentiment,liquidityScore:result.breakdown.liquidity,technicalWeight:result.weights.technical,fundamentalWeight:result.weights.fundamental,sentimentWeight:result.weights.sentiment,liquidityWeight:result.weights.liquidity,justification:result.justification as any,risks:result.risks as any,priceAtSignal:asset.quote.price,targetPrice:result.targetPrice,stopLoss:result.stopLoss,horizon:result.horizon,expiresAt:new Date(Date.now()+24*60*60*1000)}});
    return created(res,{signal,result});
  }catch(err){return serverError(res,err);}
},{minPlan:'PRO'});