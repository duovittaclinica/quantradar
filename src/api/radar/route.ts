import type{NextApiRequest,NextApiResponse}from 'next';
import{prisma}from '../lib/prisma';
import{logger}from '../lib/logger';
import{cache}from '../services/cache/redis';
import{runRadar}from '../services/scoring/radar';

export async function getRadar(profile='MODERADO',type?:string,minScore=0,planMaxAssets=10){
  const cacheKey=`radar:${profile}:${type??'all'}:${minScore}`;
  const cached=await cache.get(cacheKey);
  if(cached)return cached;
  const assets=await prisma.asset.findMany({where:{active:true},take:Math.max(planMaxAssets,30)});
  const results=await runRadar(assets,profile as any);
  const filtered=results
    .filter((r:any)=>!type||r.type===type)
    .filter((r:any)=>r.score>=minScore)
    .slice(0,planMaxAssets);
  await cache.set(cacheKey,filtered,300);
  return filtered;
}
