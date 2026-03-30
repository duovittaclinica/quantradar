import prisma from '../../database/client';
import{cache}from '../cache/redis';
import type{EnrichedAsset}from '../../types';
export type AlertChannel='panel'|'email'|'push'|'telegram';
export interface AlertCondition{field:'score'|'price'|'changePercent'|'rsi'|'volume';operator:'gte'|'lte'|'gt'|'lt'|'eq';value:number;}
function evaluate(actual:number,op:AlertCondition['operator'],threshold:number):boolean{switch(op){case'gte':return actual>=threshold;case'lte':return actual<=threshold;case'gt':return actual>threshold;case'lt':return actual<threshold;case'eq':return actual===threshold;default:return false;}}
function getFieldValue(asset:EnrichedAsset,signal:any,field:AlertCondition['field']):number{switch(field){case'score':return signal?.score??0;case'price':return asset.quote.price;case'changePercent':return asset.quote.changePercent;case'rsi':return asset.technicals.rsi14;case'volume':return asset.quote.volume;default:return 0;}}
export async function checkAndDispatchAlerts(asset:EnrichedAsset,latestSignalScore?:number):Promise<number>{
  const alerts=await prisma.alert.findMany({where:{active:true,triggered:false,asset:{ticker:asset.ticker}},include:{user:{select:{id:true,email:true}}}});
  if(!alerts.length)return 0;let dispatched=0;
  for(const alert of alerts){
    try{
      const cond=alert.condition as AlertCondition;const sig=latestSignalScore?{score:latestSignalScore}:null;
      const actual=getFieldValue(asset,sig,cond.field);const triggered=evaluate(actual,cond.operator,cond.value);
      if(!triggered)continue;
      await prisma.alert.update({where:{id:alert.id},data:{triggered:true,triggeredAt:new Date()}});
      console.log(`[Alert] ${asset.ticker}: ${cond.field} ${cond.operator} ${cond.value} (actual: ${actual.toFixed(2)})`);
      dispatched++;
    }catch(err){console.error(`[Alert] check failed:`,err);}
  }
  return dispatched;
}
export async function createScoreAlert(userId:string,ticker:string,minScore:number,channels:AlertChannel[]=['panel']){
  const asset=await prisma.asset.findUnique({where:{ticker}});if(!asset)throw new Error(`Asset ${ticker} not found`);
  await prisma.alert.create({data:{userId,assetId:asset.id,type:'SCORE_THRESHOLD',condition:{field:'score',operator:'gte',value:minScore} as AlertCondition,message:`${ticker} atingiu score ${minScore}+`,channels}});
}
export async function createPriceAlert(userId:string,ticker:string,targetPrice:number,direction:'above'|'below',channels:AlertChannel[]=['panel']){
  const asset=await prisma.asset.findUnique({where:{ticker}});if(!asset)throw new Error(`Asset ${ticker} not found`);
  const op=direction==='above'?'gte':'lte';const label=direction==='above'?'atingiu':`caiu abaixo de`;
  await prisma.alert.create({data:{userId,assetId:asset.id,type:'PRICE_TARGET',condition:{field:'price',operator:op,value:targetPrice} as AlertCondition,message:`${ticker} ${label} R$ ${targetPrice}`,channels}});
}