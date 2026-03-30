import{getBatchEnrichedAssets}from '../services/market-data';
import{getMarketNews}from '../services/news/newsapi';
import{enrichNewsWithSentiment,getTickerSentimentScore}from '../services/sentiment/analyzer';
import{batchCalculateScores}from '../services/scoring/engine';
import{cache}from '../services/cache/redis';
import{config}from '../lib/config';
import prisma from '../database/client';
export interface JobResult{jobName:string;status:'success'|'error';duration:number;itemCount:number;message?:string;}
export async function runRadarUpdate():Promise<JobResult>{
  const start=Date.now(),jobName='radar-update';
  try{
    const tickers=config.radar.defaultTickers as unknown as string[];
    const assets=await getBatchEnrichedAssets(tickers);
    const rawNews=await getMarketNews(40);
    const enrichedNews=await enrichNewsWithSentiment(rawNews);
    const sentimentMap=new Map<string,number>();
    await Promise.all(assets.map(async asset=>{const relevant=enrichedNews.filter(n=>n.relatedTickers.includes(asset.ticker));if(relevant.length>0){const{score}=await getTickerSentimentScore(relevant);sentimentMap.set(asset.ticker,score);}}));
    const scores=batchCalculateScores(assets,sentimentMap,'MODERADO');
    let persisted=0;
    for(const result of scores.slice(0,20)){
      const asset=assets.find(a=>a.ticker===result.ticker);if(!asset)continue;
      try{
        const dbAsset=await prisma.asset.upsert({where:{ticker:result.ticker},create:{ticker:result.ticker,name:asset.name,type:asset.type as any,sector:asset.sector},update:{updatedAt:new Date()}});
        await prisma.signal.create({data:{assetId:dbAsset.id,score:result.score,tag:result.tag,technicalScore:result.breakdown.technical,fundamentalScore:result.breakdown.fundamental,sentimentScore:result.breakdown.sentiment,liquidityScore:result.breakdown.liquidity,technicalWeight:result.weights.technical,fundamentalWeight:result.weights.fundamental,sentimentWeight:result.weights.sentiment,liquidityWeight:result.weights.liquidity,justification:result.justification as any,risks:result.risks as any,priceAtSignal:asset.quote.price,targetPrice:result.targetPrice,stopLoss:result.stopLoss,horizon:result.horizon,expiresAt:new Date(Date.now()+6*60*60*1000)}});
        persisted++;
      }catch{}
    }
    await cache.invalidatePattern('radar:*');await cache.invalidatePattern('score:*');
    const duration=Date.now()-start;
    await prisma.jobLog.create({data:{jobName,status:'success',duration,itemCount:assets.length,message:`Scored ${scores.length}, persisted ${persisted}`}});
    return{jobName,status:'success',duration,itemCount:assets.length};
  }catch(err){
    const duration=Date.now()-start,message=(err as Error).message;
    await prisma.jobLog.create({data:{jobName,status:'error',duration,message}}).catch(()=>{});
    return{jobName,status:'error',duration,itemCount:0,message};
  }
}
export async function runAlertChecker():Promise<JobResult>{
  const start=Date.now(),jobName='alert-checker';
  try{
    const activeAlerts=await prisma.alert.findMany({where:{active:true,triggered:false},include:{asset:{include:{signals:{take:1,orderBy:{generatedAt:'desc'}}}},user:true}});
    let triggered=0;
    for(const alert of activeAlerts){
      const signal=alert.asset?.signals[0];if(!signal)continue;
      const cond=alert.condition as{field:string;operator:string;value:number};
      let shouldTrigger=false;
      if(cond.field==='score'&&signal.score>=cond.value)shouldTrigger=true;
      if(shouldTrigger){await prisma.alert.update({where:{id:alert.id},data:{triggered:true,triggeredAt:new Date()}});triggered++;}
    }
    const duration=Date.now()-start;
    await prisma.jobLog.create({data:{jobName,status:'success',duration,itemCount:triggered}});
    return{jobName,status:'success',duration,itemCount:triggered};
  }catch(err){return{jobName,status:'error',duration:Date.now()-start,itemCount:0,message:String(err)};}
}